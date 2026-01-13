import { generateText, Output, tool } from "ai";
import { z } from "zod";

import { RESUME_ANALYZER_MODEL } from "@/ai/constants";
import { checkAuth } from "@/lib/auth-check";
import { getFullProfile } from "@/lib/db/profile";

import { TailoredSummaryOutputSchema, SummaryApprovalSchema } from "./schemas";

const TAILOR_SUMMARY_PROMPT = `
You are an expert resume writer. Your task is to analyze the job description and the user's current profile to create a highly tailored professional summary.

Steps:
1. Analyze the Job Description to identify top 3-5 critical hard skills and 2 soft skills.
2. Analyze the User's Profile (current summary, skills, experience) to see what matches.
3. Calculate a "Match Score" (0-100) based on how well the CURRENT or PROPOSED summary fits the job.
   - If the user has relevant experience, the tailored summary should aim for a high score (90+).
4. Create a "Match Analysis": A single sentence translating the score (e.g., "Matches 95% of key requirements including Python and Leadership").
5. Write the "Suggested Summary": 2-3 powerful sentences incorporating the keywords naturally.
6. Provide "Reasoning": Why is this better?
7. List "Keywords Incorporated": The specific keywords from the JD you used.

Maximize the impact. Use action verbs.
`;

export const tailorSummaryTool = tool({
  description:
    "Generate a tailored professional summary for the user's resume based on the job description. Shows the current summary and a suggested improvement. The user can accept, edit, or skip.",
  inputSchema: z.object({
    jobTitle: z.string().describe("The target job title"),
    jobDescription: z.string().describe("The full job description"),
  }),
  outputSchema: TailoredSummaryOutputSchema,
  strict: true,
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

    return { ...output, stepCompleted: "tailor_summary" as const };
  },
});

export const approveSummaryTool = tool({
  description:
    "Show the approval form for the tailored summary. Call this immediately after tailorSummary completes. No message needed - the UI will display the summary automatically.",
  inputSchema: z.object({}),
  outputSchema: SummaryApprovalSchema,
});

export type TailorSummaryTool = typeof tailorSummaryTool;
export type ApproveSummaryTool = typeof approveSummaryTool;
