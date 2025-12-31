import { generateText, Output, tool } from "ai";
import { z } from "zod";

import { RESUME_ANALYZER_MODEL } from "@/ai/constants";
import { checkAuth } from "@/lib/auth-check";
import { getFullProfile } from "@/lib/db/profile";

import { TailoredSummaryOutputSchema, SummaryApprovalSchema } from "./schemas";

const TAILOR_SUMMARY_PROMPT = `You are a resume expert. Generate a tailored professional summary for a job application.

## Task
Create a compelling 2-3 sentence professional summary that:
1. Highlights the candidate's most relevant experience for this specific role
2. Incorporates key terms from the job description naturally
3. Positions the candidate as an ideal fit

## Output Requirements
- current: The user's existing summary/bio (or null if none)
- suggested: Your tailored 2-3 sentence summary
- reasoning: Brief explanation of why this summary works better (1-2 sentences)
- keywordsIncorporated: Array of job description keywords you included

## Style Guidelines
- Start with years of experience or a strong qualifier
- Use active, confident language
- Be specific, not generic
- Avoid buzzwords like "passionate", "driven", "results-oriented"
- Keep it under 50 words`;

export const tailorSummaryTool = tool({
  description:
    "Generate a tailored professional summary for the user's resume based on the job description. Shows the current summary and a suggested improvement. The user can accept, edit, or skip.",
  inputSchema: z.object({
    jobTitle: z.string().describe("The target job title"),
    jobDescription: z.string().describe("The full job description"),
  }),
  outputSchema: TailoredSummaryOutputSchema,
  execute: async ({ jobTitle, jobDescription }) => {
    const session = await checkAuth();
    if (!session) {
      throw new Error("Unauthorized");
    }

    const profile = await getFullProfile(session.user.id);
    if (!profile) {
      throw new Error("No profile found. Please create your profile first.");
    }

    const currentSummary = profile.bio || profile.headline || null;
    const skills =
      profile.skills?.map((s) => s.name).join(", ") || "Not specified";
    const experience = profile.workExperiences?.[0]
      ? `${profile.workExperiences[0].position} at ${profile.workExperiences[0].company}`
      : "Not specified";

    const prompt = `Generate a tailored professional summary.

CURRENT SUMMARY: ${currentSummary || "None"}
CURRENT HEADLINE: ${profile.headline || "None"}
KEY SKILLS: ${skills}
MOST RECENT ROLE: ${experience}

TARGET JOB TITLE: ${jobTitle}
JOB DESCRIPTION:
${jobDescription}`;

    const { output } = await generateText({
      model: RESUME_ANALYZER_MODEL,
      output: Output.object({
        schema: TailoredSummaryOutputSchema,
      }),
      system: TAILOR_SUMMARY_PROMPT,
      prompt,
    });

    return output;
  },
});

export const approveSummaryTool = tool({
  description:
    "Collect user's approval or edits for the tailored summary. Called after showing the summary suggestion.",
  inputSchema: z.object({
    message: z.string().describe("Message to show with the approval form"),
  }),
  outputSchema: SummaryApprovalSchema,
});

export type TailorSummaryTool = typeof tailorSummaryTool;
export type ApproveSummaryTool = typeof approveSummaryTool;
