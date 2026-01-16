import { tool } from "ai";
import { SkipStepInputSchema, SkipStepOutputSchema } from "./schemas";

function getApprovalStepId(stepId: string): string | null {
  if (stepId === "tailor_summary") return "approve_summary";
  if (stepId === "tailor_skills") return "approve_skills";
  if (stepId.startsWith("tailor_exp_")) {
    return stepId.replace("tailor_exp_", "approve_exp_");
  }
  return null;
}

export const skipStepTool = tool({
  description: "Skip a step in the tailoring plan",
  inputSchema: SkipStepInputSchema,
  outputSchema: SkipStepOutputSchema,
  execute: async ({ stepId }) => {
    // Calculate the related approval step ID
    const approvalStepId = getApprovalStepId(stepId);

    // Return output - DB updates handled by API route onFinish
    return {
      skipped: true,
      stepId,
      relatedStepId: approvalStepId,
    };
  },
});

export type SkipStepTool = typeof skipStepTool;
