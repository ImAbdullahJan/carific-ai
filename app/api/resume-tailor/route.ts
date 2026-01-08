import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  convertToModelMessages,
  generateId,
} from "ai";
import { NextResponse } from "next/server";

import { resumeTailorAgent, type ResumeTailorAgentUIMessage } from "@/ai/agent";
import { checkAuth } from "@/lib/auth-check";
import { upsertMessage, loadChat } from "@/lib/db/tailoring-chat";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      message,
      chatId,
    }: {
      message: ResumeTailorAgentUIMessage;
      chatId: string;
    } = await request.json();

    // Save the incoming message first (user or assistant with tool result)
    await upsertMessage({ chatId, id: message.id, message });

    // Load all messages from database (includes the just-saved message)
    const messages = await loadChat(chatId);

    const stream = createUIMessageStream({
      execute: async ({ writer }) => {
        // If the last message is a user message, create start events
        // If assistant message (e.g. adding tool result), keep as part of previous step
        if (message.role === "user") {
          writer.write({
            type: "start",
            messageId: generateId(),
          });
        }

        const result = await resumeTailorAgent.stream({
          messages: await convertToModelMessages(messages),
        });

        // Consume stream to ensure it runs to completion
        result.consumeStream();

        // Merge agent output into the UI stream
        writer.merge(result.toUIMessageStream({ sendStart: false }));
      },
      onError: (error) => {
        return error instanceof Error ? error.message : String(error);
      },
      originalMessages: messages,
      onFinish: async ({ responseMessage }) => {
        try {
          await upsertMessage({
            chatId,
            id: responseMessage.id,
            message: responseMessage,
          });
        } catch (error) {
          console.error("Failed to persist response message:", error);
        }
      },
    });

    return createUIMessageStreamResponse({ stream });
  } catch (error) {
    console.error("Resume tailor error:", error);
    return NextResponse.json(
      { error: "Failed to process tailor request" },
      { status: 500 }
    );
  }
}
