import { tool } from "ai";
import { SkipStepInputSchema, SkipStepOutputSchema } from "./schemas";
import { getApprovalStepId } from "@/lib/utils/resume-tailor";
import { getPlanSteps } from "@/lib/db/tailoring-chat";

export const skipStepTool = (chatId: string) =>
  tool({
    description: "Skip a step in the tailoring plan",
    inputSchema: SkipStepInputSchema,
    outputSchema: SkipStepOutputSchema,
    needsApproval: true,
    execute: async ({ stepId }) => {
      // Calculate the related approval step ID
      const approvalStepId = getApprovalStepId(stepId);

      // Find the next step in the plan after this one (and its approval step)
      const steps = await getPlanSteps(chatId);
      const currentIndex = steps.findIndex((s) => s.stepId === stepId);
      const skipCount = approvalStepId ? 2 : 1; // Skip both tailor and approval step
      const nextStepData = steps[currentIndex + skipCount] || null;

      const nextStep = nextStepData
        ? {
            stepId: nextStepData.stepId,
            type: nextStepData.type,
            experienceId: nextStepData.experienceId,
          }
        : null;

      // Return output - DB updates handled by API route onFinish
      return {
        skipped: true,
        stepId,
        relatedStepId: approvalStepId,
        nextStep,
      };
    },
  });

export type SkipStepTool = ReturnType<typeof skipStepTool>;
