import { z } from "zod";

export const RESUME_MIN_LENGTH = 50;
export const RESUME_MAX_LENGTH = 50_000;
export const JOB_DESCRIPTION_MIN_LENGTH = 50;
export const JOB_DESCRIPTION_MAX_LENGTH = 10_000;

export const ResumeAnalysisSchema = z.object({
  resumeText: z
    .string({ error: "Resume is required" })
    .min(RESUME_MIN_LENGTH, {
      error: `Resume must be at least ${RESUME_MIN_LENGTH} characters`,
    })
    .max(RESUME_MAX_LENGTH, {
      error: `Resume exceeds maximum length of ${RESUME_MAX_LENGTH.toLocaleString()} characters`,
    }),
  jobDescription: z
    .string({ error: "Job description is required" })
    .min(JOB_DESCRIPTION_MIN_LENGTH, {
      error: `Job description must be at least ${JOB_DESCRIPTION_MIN_LENGTH} characters`,
    })
    .max(JOB_DESCRIPTION_MAX_LENGTH, {
      error: `Job description exceeds maximum length of ${JOB_DESCRIPTION_MAX_LENGTH.toLocaleString()} characters`,
    }),
});

export type ResumeAnalysisInput = z.infer<typeof ResumeAnalysisSchema>;
