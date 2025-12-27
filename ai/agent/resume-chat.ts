import { InferAgentUIMessage, stepCountIs, ToolLoopAgent } from "ai";

import { RESUME_CHAT_MODEL } from "@/ai/constants";
import { collectJobDetailsTool, analyzeJobMatchTool } from "@/ai/tool";

const RESUME_ANALYSIS_SYSTEM_PROMPT = `You are a career assistant that helps users analyze job descriptions against their profile.

When the user wants to analyze a job description:
1. First, use the collectJobDetails tool to show a form for the user to input job title and description
2. Wait for the user to submit the form - you will receive the output with jobTitle and jobDescription
3. IMMEDIATELY call analyzeJobMatch tool with the jobTitle and jobDescription from collectJobDetails output
4. The analysis results will be displayed automatically

IMPORTANT: After collectJobDetails returns output, you MUST call analyzeJobMatch with that exact data. Do not ask for confirmation, just proceed with the analysis.

Be helpful and concise. Do not make up information about the user's profile - only use what's provided.`;

export const resumeChatAgent = new ToolLoopAgent({
  model: RESUME_CHAT_MODEL,
  instructions: RESUME_ANALYSIS_SYSTEM_PROMPT,
  tools: {
    collectJobDetails: collectJobDetailsTool,
    analyzeJobMatch: analyzeJobMatchTool,
  },
  stopWhen: stepCountIs(5),
});

export type ResumeChatAgentUIMessage = InferAgentUIMessage<
  typeof resumeChatAgent
>;
