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
  matchScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "A score from 0-100 indicating how well the summary matches the job"
    ),
  matchAnalysis: z
    .string()
    .describe("A brief analysis explaining the match score quality"),
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
  "tailor_experience",
  "approve_summary",
  "approve_experience",
  "tailor_skills",
  "approve_skills",
]);
export type PlanStepType = z.infer<typeof PlanStepTypeSchema>;

export const PlanStepSchema = z.object({
  id: z.string(),
  type: PlanStepTypeSchema,
  label: z.string(),
  description: z.string().optional(),
  context: z.object({ experienceId: z.string().optional() }).optional(),
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

export const TailoredExperienceOutputSchema = z.object({
  experienceId: z.string(),
  originalRole: z.string(),
  originalCompany: z.string(),
  originalBullets: z
    .array(z.string())
    .describe("The candidate's original bullet points before optimization"),
  relevanceScore: z
    .number()
    .min(0)
    .max(100)
    .describe(
      "How relevant this role is to the target job (0-100). 90+: Directly related, 70-89: Related with transferable skills, 50-69: Some relevance, <50: Limited relevance"
    ),
  suggestedBullets: z
    .array(z.string())
    .min(2)
    .max(6)
    .describe("2-6 optimized bullet points, reordered by relevance"),
  reasoning: z
    .string()
    .describe("Brief explanation of why these changes improve the resume"),
  improvements: z
    .array(z.string())
    .describe(
      "2-3 specific improvements made (e.g., 'Added React keyword', 'Quantified impact with metrics')"
    ),
  stepCompleted: z.literal("tailor_experience").nullable(),
});
export type TailoredExperienceOutput = z.infer<
  typeof TailoredExperienceOutputSchema
>;

export const ExperienceApprovalSchema = z.object({
  experienceId: z.string(),
  approved: z.boolean(),
  finalBullets: z.array(z.string()).optional(),
  stepCompleted: z.literal("approve_experience").nullable(),
});
export type ExperienceApproval = z.infer<typeof ExperienceApprovalSchema>;

export const TailoredSkillsOutputSchema = z.object({
  originalSkills: z.array(
    z.object({
      name: z.string(),
      category: z.string().nullable(),
    })
  ),
  suggestedSkills: z.array(
    z.object({
      name: z.string(),
      category: z.string(),
      relevance: z.enum(["high", "medium", "low"]),
      isNew: z
        .boolean()
        .describe("True if this is a suggested skill not in original"),
    })
  ),
  reasoning: z.string(),
  improvements: z.array(z.string()),
  keywordsMatched: z.array(z.string()),
  stepCompleted: z.literal("tailor_skills").nullable(),
});
export type TailoredSkillsOutput = z.infer<typeof TailoredSkillsOutputSchema>;

export const SkillsApprovalSchema = z.object({
  approved: z.boolean(),
  finalSkills: z
    .array(
      z.object({
        name: z.string(),
        category: z.string(),
      })
    )
    .optional(),
  stepCompleted: z.literal("approve_skills").nullable(),
});
export type SkillsApproval = z.infer<typeof SkillsApprovalSchema>;

export const SkipStepInputSchema = z.object({
  stepId: z.string(),
});
export type SkipStepInput = z.infer<typeof SkipStepInputSchema>;

export const SkipStepOutputSchema = z.object({
  skipped: z.boolean(),
  stepId: z.string(),
  relatedStepId: z.string().nullable(),
  nextStep: z
    .object({
      stepId: z.string(),
      type: z.string(),
      experienceId: z.string().nullable(),
    })
    .nullable(),
});
export type SkipStepOutput = z.infer<typeof SkipStepOutputSchema>;

export const PendingStepSchema = z.object({
  stepId: z.string(),
  type: z.string(),
  label: z.string(),
  description: z.string().nullable(),
  experienceId: z.string().nullable(),
});

export const GetPendingStepsOutputSchema = z.object({
  pendingSteps: z.array(PendingStepSchema),
  completedCount: z.number(),
  skippedCount: z.number(),
  pendingCount: z.number(),
  totalCount: z.number(),
});
export type GetPendingStepsOutput = z.infer<typeof GetPendingStepsOutputSchema>;
