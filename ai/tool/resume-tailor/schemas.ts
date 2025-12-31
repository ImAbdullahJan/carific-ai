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
});
export type TailoredSummaryOutput = z.infer<typeof TailoredSummaryOutputSchema>;

export const SummaryApprovalSchema = z.object({
  approved: z.boolean(),
  customText: z
    .string()
    .optional()
    .describe("User's custom text if they edited the suggestion"),
});
export type SummaryApproval = z.infer<typeof SummaryApprovalSchema>;
