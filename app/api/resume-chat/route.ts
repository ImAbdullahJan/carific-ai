import { createAgentUIStreamResponse } from "ai";

import { resumeChatAgent, type ResumeChatAgentUIMessage } from "@/ai/agent";
import { checkAuth } from "@/lib/auth-check";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { messages }: { messages: ResumeChatAgentUIMessage[] } =
      await request.json();

    return createAgentUIStreamResponse({
      agent: resumeChatAgent,
      uiMessages: messages,
    });
  } catch (error) {
    console.error("Resume chat error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}
