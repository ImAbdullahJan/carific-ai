import { tool } from "ai";
import { SkipStepInputSchema, SkipStepOutputSchema } from "./schemas";
import { getApprovalStepId } from "@/lib/utils/resume-tailor";

export const skipStepTool = tool({
  description: "Skip a step in the tailoring plan",
  inputSchema: SkipStepInputSchema,
  outputSchema: SkipStepOutputSchema,
  needsApproval: true,
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
