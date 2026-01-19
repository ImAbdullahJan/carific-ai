import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  convertToModelMessages,
  generateId,
} from "ai";
import { NextResponse } from "next/server";

import {
  createResumeTailorAgent,
  type ResumeTailorAgentUIMessage,
} from "@/ai/agent";
import { checkAuth } from "@/lib/auth-check";
import {
  upsertMessage,
  loadChat,
  getChat,
  getChatWithOwner,
  completeStep,
  skipStep,
} from "@/lib/db/tailoring-chat";
import { applyApprovedChanges } from "@/lib/db/resume";

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

    // 1. Validation: Ensure required fields are present
    if (!chatId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Authorization: Verify user owns this chat (IDOR protection)
    const chatWithOwner = await getChatWithOwner(chatId);
    if (!chatWithOwner) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    if (chatWithOwner.resume.profile.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

        const agent = createResumeTailorAgent(chatId);
        const result = await agent.stream({
          messages: await convertToModelMessages(messages),
        });

        // Consume stream to ensure it runs to completion
        result.consumeStream();

        // Merge agent output into the UI stream
        writer.merge(result.toUIMessageStream({ sendStart: false }));
      },
      onError: (error) => {
        console.error("Stream error:", error);
        return "An error occurred while processing your request";
      },
      originalMessages: messages,
      onFinish: async ({ responseMessage }) => {
        try {
          await upsertMessage({
            chatId,
            id: responseMessage.id,
            message: responseMessage,
          });

          // Update step status based on tool outputs
          for (const part of responseMessage.parts) {
            if (!("state" in part)) continue;

            // Handle successful tool outputs
            if (part.state === "output-available") {
              // Map tool types to step IDs and mark as complete
              if (part.type === "tool-collectJobDetails") {
                await completeStep(chatId, "collect_jd");
              } else if (part.type === "tool-tailorSummary") {
                await completeStep(chatId, "tailor_summary");
              } else if (part.type === "tool-approveSummary") {
                await completeStep(chatId, "approve_summary");
              } else if (
                part.type === "tool-tailorExperienceEntry" &&
                part.output?.experienceId
              ) {
                await completeStep(
                  chatId,
                  `tailor_exp_${part.output.experienceId}`
                );
              } else if (
                part.type === "tool-approveExperienceEntry" &&
                part.output?.experienceId
              ) {
                await completeStep(
                  chatId,
                  `approve_exp_${part.output.experienceId}`
                );
              } else if (part.type === "tool-tailorSkills") {
                await completeStep(chatId, "tailor_skills");
              } else if (part.type === "tool-approveSkills") {
                await completeStep(chatId, "approve_skills");
              } else if (part.type === "tool-skipStep" && part.output) {
                // Handle skipStep tool - mark step(s) as skipped in DB
                const { stepId, relatedStepId } = part.output;
                await skipStep(chatId, stepId);
                if (relatedStepId) {
                  await skipStep(chatId, relatedStepId);
                }
              }
            }
          }

          // Check for approved changes and persist to resume
          const chat = await getChat(chatId);
          if (chat) {
            // We need the full history to resolve references (e.g. suggested bullets from previous turn)
            const allMessages = await loadChat(chatId);
            await applyApprovedChanges(
              chat.resumeId,
              responseMessage,
              allMessages
            );
          }
        } catch (error) {
          console.error("Failed to persist response or resume updates:", error);
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
