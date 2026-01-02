import { z } from "zod";

export const TailoredSummaryOutputSchema = z.object({
  current: z
    .string()
    .nullable()
    .describe("The user's current summary/headline, or null if missing"),
  suggested: z
    .string()
    .describe(
      "A tailored 2-3 sentence professional summary for this specific job"
    ),
  reasoning: z
    .string()
    .describe("Brief explanation of why this summary is better for this role"),
  keywordsIncorporated: z
    .array(z.string())
    .describe("Keywords from the job description included in the summary"),
  stepCompleted: z.literal("tailor_summary").nullable(),
});
export type TailoredSummaryOutput = z.infer<typeof TailoredSummaryOutputSchema>;

export const SummaryApprovalSchema = z.object({
  approved: z.boolean(),
  customText: z
    .string()
    .nullable()
    .describe("User's custom text if they edited the suggestion"),
  stepCompleted: z.literal("approve_summary").nullable(),
});
export type SummaryApproval = z.infer<typeof SummaryApprovalSchema>;

// Plan Schemas
export const PlanStepTypeSchema = z.enum([
  "collect_jd",
  "tailor_summary",
  "approve_summary",
  "finalize",
]);
export type PlanStepType = z.infer<typeof PlanStepTypeSchema>;

export const PlanStepSchema = z.object({
  id: z.string(),
  type: PlanStepTypeSchema,
  label: z.string(),
  description: z.string(),
});
export type PlanStep = z.infer<typeof PlanStepSchema>;

export const TailoringPlanSchema = z.object({
  steps: z.array(PlanStepSchema),
  targetJob: z.object({
    title: z.string().nullable(),
    description: z.string().nullable(),
  }),
});
export type TailoringPlan = z.infer<typeof TailoringPlanSchema>;
