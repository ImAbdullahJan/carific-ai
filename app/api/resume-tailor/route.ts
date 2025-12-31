import { createAgentUIStreamResponse } from "ai";

import { resumeTailorAgent, type ResumeTailorAgentUIMessage } from "@/ai/agent";
import { checkAuth } from "@/lib/auth-check";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { messages }: { messages: ResumeTailorAgentUIMessage[] } =
      await request.json();

    return createAgentUIStreamResponse({
      agent: resumeTailorAgent,
      uiMessages: messages,
    });
  } catch (error) {
    console.error("Resume tailor error:", error);
    return NextResponse.json(
      { error: "Failed to process tailor request" },
      { status: 500 }
    );
  }
}
