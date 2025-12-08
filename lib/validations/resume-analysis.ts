import { z } from "zod";

export const ResumeAnalysisSchema = z.object({
  resumeText: z
    .string({ error: "Resume is required" })
    .min(50, { error: "Resume must be at least 50 characters" })
    .max(50000, {
      error: "Resume exceeds maximum length of 50,000 characters",
    }),
  jobDescription: z
    .string({ error: "Job description is required" })
    .min(50, { error: "Job description must be at least 50 characters" })
    .max(10000, {
      error: "Job description exceeds maximum length of 10,000 characters",
    }),
});

export type ResumeAnalysisInput = z.infer<typeof ResumeAnalysisSchema>;

// Constants for UI display
export const RESUME_MIN_LENGTH = 50;
export const RESUME_MAX_LENGTH = 50000;
export const JOB_DESCRIPTION_MIN_LENGTH = 50;
export const JOB_DESCRIPTION_MAX_LENGTH = 10000;
