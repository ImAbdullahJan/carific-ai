import { tool } from "ai";
import { z } from "zod";
import { TailoringPlanSchema } from "./schemas";

export const createTailoringPlanTool = tool({
  description:
    "Create a tailoring plan for the user's resume. Call this immediately on the first user message. No need to analyze user intent - just call it.",
  inputSchema: z.object({}),
  outputSchema: TailoringPlanSchema,
  execute: async () => {
    // For now, return a fixed plan for summary tailoring
    // In the future, this could be AI-driven based on user intent
    return {
      steps: [
        {
          id: "collect_jd",
          type: "collect_jd" as const,
          label: "Collect Job Details",
          description: "Get the job title and description from you",
        },
        {
          id: "tailor_summary",
          type: "tailor_summary" as const,
          label: "Tailor Summary",
          description: "Generate a tailored professional summary",
        },
        {
          id: "approve_summary",
          type: "approve_summary" as const,
          label: "Review & Approve",
          description: "Review and approve the suggested changes",
        },
        {
          id: "finalize",
          type: "finalize" as const,
          label: "Finalize",
          description: "Save changes to your resume",
        },
      ],
      targetJob: {
        title: null,
        description: null,
      },
    };
  },
});
