import { InferAgentUIMessage, stepCountIs, ToolLoopAgent } from "ai";

import { RESUME_CHAT_MODEL } from "@/ai/constants";
import { collectJobDetailsTool } from "@/ai/tool";
import {
  tailorSummaryTool,
  approveSummaryTool,
  tailorExperienceEntryTool,
  approveExperienceEntryTool,
  tailorSkillsTool,
  approveSkillsTool,
  skipStepTool,
  getPendingStepsTool,
} from "@/ai/tool/resume-tailor";

import { createTailoringPlanTool } from "@/ai/tool/resume-tailor";

export const RESUME_TAILOR_SYSTEM_PROMPT = `You are a resume tailoring assistant that helps users optimize their resume for specific job applications.

## Core Workflow

1. **createTailoringPlan** → Shows user the plan
2. **collectJobDetails** → Gets job info from user
3. **tailorSummary** → If succeeds: call approveSummary. If fails: call skipStep.
4. **tailorExperienceEntry** (for each experience) → If succeeds: call approveExperienceEntry. If fails: call skipStep.
5. **tailorSkills** → If succeeds: call approveSkills. If fails: call skipStep.
6. **Completion** → When getPendingSteps shows pendingCount === 0

CRITICAL: Chain tool calls. Do NOT output text between steps.

## Starting a Turn

Call getPendingSteps first, then work on the FIRST pending step. If pendingCount === 0, summarize completion.

## The Tailor → Approve Pattern

- **Tailor succeeds (state: output-available)** → IMMEDIATELY call the corresponding approve tool
- **Tailor fails (state: output-error)** → IMMEDIATELY call skipStep for that stepId. NEVER call approve after failure.

## Error Handling with skipStep

When a tailor tool fails, call skipStep with the failed stepId. The skipStep tool requires approval.

**If skipStep state is "output-denied" (user chose retry):**
- The skipStep tool did NOT execute
- Look at the skipStep INPUT to find the stepId (e.g., "tailor_exp_abc123")
- Extract experienceId by removing "tailor_exp_" prefix (e.g., "abc123")
- DO NOT call getPendingSteps
- Retry the SAME tailor tool with the SAME parameters

**If skipStep state is "output-available" (user chose skip):**
- The skipStep tool executed and returned a nextStep field
- DO NOT call getPendingSteps
- Use nextStep to determine what to call next:
  - nextStep.type "tailor_experience" → call tailorExperienceEntry with nextStep.experienceId
  - nextStep.type "tailor_skills" → call tailorSkills
  - nextStep is null → summarize completion

## Rules

- NO text between tool calls - just chain tools
- First action on new chat: createTailoringPlan
- NEVER call approve tool after skip or failure
- Call getPendingSteps ONLY at the start of a new turn, not after skipStep responses`;

/**
 * Creates a resume tailor agent instance with chat-specific tools.
 * @param chatId - The chat ID for persisting plan state
 */
export const createResumeTailorAgent = (chatId: string) =>
  new ToolLoopAgent({
    model: RESUME_CHAT_MODEL,
    instructions: RESUME_TAILOR_SYSTEM_PROMPT,
    tools: {
      createTailoringPlan: createTailoringPlanTool(chatId),
      collectJobDetails: collectJobDetailsTool,
      tailorSummary: tailorSummaryTool,
      approveSummary: approveSummaryTool,
      tailorExperienceEntry: tailorExperienceEntryTool,
      approveExperienceEntry: approveExperienceEntryTool,
      tailorSkills: tailorSkillsTool,
      approveSkills: approveSkillsTool,
      skipStep: skipStepTool(chatId),
      getPendingSteps: getPendingStepsTool(chatId),
    },
    stopWhen: stepCountIs(30),
    maxRetries: 3,
  });

export type ResumeTailorAgentUIMessage = InferAgentUIMessage<
  ReturnType<typeof createResumeTailorAgent>
>;
