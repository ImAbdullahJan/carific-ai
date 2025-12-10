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

// === Structured Output Schema ===

export const MissingKeywordSchema = z.object({
  keyword: z.string().describe("The missing keyword or skill"),
  category: z.enum(["Hard Skill", "Soft Skill", "Domain"]),
  importance: z.enum(["Critical", "Important", "Nice to Have"]),
  whereToAdd: z
    .string()
    .describe(
      "Specific location in resume where this should be added, e.g. 'Skills section' or 'Experience at Company X'"
    ),
});

export const SectionFeedbackSchema = z.object({
  section: z.enum(["Contact", "Summary", "Experience", "Education", "Skills"]),
  status: z.enum(["Present", "Missing", "Incomplete"]),
  feedback: z.string().describe("Specific feedback if missing or incomplete"),
});

export const BulletFixSchema = z.object({
  location: z
    .string()
    .describe(
      "Where this bullet is in the resume, e.g. 'Experience → Acme Corp → 2nd bullet'"
    ),
  original: z.string().describe("The exact text from the user's resume"),
  improved: z
    .string()
    .describe("The suggested replacement with metrics and strong verbs"),
  reason: z
    .string()
    .describe("Why this improvement helps - reference the job requirements"),
  impact: z.enum(["High", "Medium"]),
});

export const ResumeAnalysisOutputSchema = z.object({
  score: z.number().min(0).max(100),
  scoreLabel: z.enum(["Poor", "Fair", "Good", "Strong", "Excellent"]),
  scoreSummary: z.string().describe("One sentence explaining the score"),

  missingKeywords: z
    .array(MissingKeywordSchema)
    .min(1)
    .describe(
      "All missing keywords from job description, prioritized by importance"
    ),

  bulletFixes: z
    .array(BulletFixSchema)
    .describe("All weak bullet points that need improvement"),

  priorityActions: z
    .array(z.string())
    .min(1)
    .max(3)
    .describe("Top 1-3 most impactful changes to make, in order of priority"),

  sectionFeedback: z
    .array(SectionFeedbackSchema)
    .length(5)
    .describe("Feedback on standard resume sections"),

  lengthAssessment: z.object({
    currentLength: z.enum(["Too Short", "Appropriate", "Too Long"]),
    recommendation: z
      .string()
      .describe("Specific recommendation based on role level"),
  }),
});

export type ResumeAnalysisOutput = z.infer<typeof ResumeAnalysisOutputSchema>;
export type MissingKeyword = z.infer<typeof MissingKeywordSchema>;
export type BulletFix = z.infer<typeof BulletFixSchema>;
export type SectionFeedback = z.infer<typeof SectionFeedbackSchema>;
