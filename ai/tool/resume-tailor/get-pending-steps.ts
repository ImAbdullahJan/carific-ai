import { tool } from "ai";
import { z } from "zod";
import { getPlanSteps, loadChat } from "@/lib/db/tailoring-chat";
import { GetPendingStepsOutputSchema } from "./schemas";

export const getPendingStepsTool = (chatId: string) =>
  tool({
    description:
      "Get the list of pending steps in the tailoring plan. Use this to check which steps still need to be completed before declaring the process complete.",
    inputSchema: z.object({}),
    outputSchema: GetPendingStepsOutputSchema,
    execute: async () => {
      const steps = await getPlanSteps(chatId);
      const messages = await loadChat(chatId);

      // Derive skipped steps from message history
      // Messages from loadChat are in UI format with parts array
      const skippedStepIds = new Set<string>();
      const completedStepIds = new Set<string>();

      for (const msg of messages) {
        if (msg.role === "assistant" && msg.parts) {
          for (const part of msg.parts) {
            // Check for skipStep tool output
            if (
              part.type === "tool-skipStep" &&
              "state" in part &&
              part.state === "output-available" &&
              "output" in part &&
              part.output
            ) {
              skippedStepIds.add(part.output.stepId);
              if (part.output.relatedStepId) {
                skippedStepIds.add(part.output.relatedStepId);
              }
            }

            // Check for completed tool outputs
            if (
              "state" in part &&
              part.state === "output-available" &&
              "output" in part &&
              part.output
            ) {
              if (part.type === "tool-collectJobDetails") {
                completedStepIds.add("collect_jd");
              } else if (part.type === "tool-tailorSummary") {
                completedStepIds.add("tailor_summary");
              } else if (part.type === "tool-approveSummary") {
                completedStepIds.add("approve_summary");
              } else if (part.type === "tool-tailorSkills") {
                completedStepIds.add("tailor_skills");
              } else if (part.type === "tool-approveSkills") {
                completedStepIds.add("approve_skills");
              } else if (
                part.type === "tool-tailorExperienceEntry" &&
                part.output.experienceId
              ) {
                completedStepIds.add(`tailor_exp_${part.output.experienceId}`);
              } else if (
                part.type === "tool-approveExperienceEntry" &&
                part.output.experienceId
              ) {
                completedStepIds.add(`approve_exp_${part.output.experienceId}`);
              }
            }
          }
        }
      }

      // Filter pending steps (not completed and not skipped)
      const pendingSteps = steps
        .filter(
          (s) =>
            !completedStepIds.has(s.stepId) &&
            !skippedStepIds.has(s.stepId) &&
            !s.type.startsWith("approve_")
        )
        .sort((a, b) => a.order - b.order)
        .map((s) => ({
          stepId: s.stepId,
          type: s.type,
          label: s.label,
          description: s.description,
          experienceId: s.experienceId,
        }));

      const completedCount = Array.from(completedStepIds).filter(
        (id) => !skippedStepIds.has(id)
      ).length;
      const skippedCount = skippedStepIds.size;
      const completedTotal = completedCount + skippedCount;
      const pendingCount = Math.max(0, steps.length - completedTotal);

      return {
        pendingSteps,
        completedCount: completedTotal, // Both completed and skipped are "done"
        skippedCount,
        pendingCount,
        totalCount: steps.length,
      };
    },
  });

export type GetPendingStepsTool = ReturnType<typeof getPendingStepsTool>;
