import { generateText, Output, tool } from "ai";
import { z } from "zod";

import { RESUME_ANALYZER_MODEL } from "@/ai/constants";
import { checkAuth } from "@/lib/auth-check";
import { getFullProfile } from "@/lib/db/profile";

import {
  TailoredExperienceOutputSchema,
  ExperienceApprovalSchema,
} from "./schemas";

const TAILOR_EXPERIENCE_PROMPT = `
You are an expert resume writer specializing in ATS optimization and impact-driven bullet points.

## Your Task
Rewrite the candidate's work experience bullets to maximize relevance for the target job while maintaining factual accuracy.

## Strategy
1. **Analyze Job Requirements**: Extract 5-10 key skills/keywords from the job description
2. **Calculate Relevance Score** (0-100):
   - 90-100: Directly related role with matching skills and responsibilities
   - 70-89: Related role with transferable skills
   - 50-69: Some relevant experience or skills
   - <50: Limited relevance to target role
3. **Optimize Bullets**:
   - Start with strongest action verbs: Led, Architected, Developed, Increased, Reduced, Launched, Designed, Implemented
   - Incorporate 2-3 keywords from job description naturally
   - Quantify impact where possible (use placeholders like [X%] or [N users] if metrics missing)
   - Keep bullets 15-25 words each
   - Reorder: most impressive/relevant first
   - Return 2-6 bullets (remove weak or irrelevant ones)
4. **Document Changes**: List 2-3 specific improvements made as SHORT phrases (e.g., "Added React keyword", "Quantified with metrics", "Emphasized leadership")

## Examples of Strong Bullets
- "Led cross-functional team of 8 engineers to deliver React-based dashboard, reducing page load time by 40%"
- "Architected microservices infrastructure using AWS Lambda and DynamoDB, processing 1M+ daily transactions"
- "Increased user engagement by 35% through A/B testing and data-driven UX improvements"
- "Reduced deployment time from 2 hours to 15 minutes by implementing CI/CD pipeline with Jenkins"

## Formatting Rules
- Start each bullet with a strong action verb (past tense for previous roles, present tense for current)
- Use numbers and metrics whenever possible
- If original bullet lacks metrics, add placeholder: "[Increased by X%]" or "[Reduced time by N hours]"
- Keep bullets concise: 15-25 words
- Use commas to separate clauses, not semicolons
- Bold key achievements or keywords using **keyword** format

## Critical Rules
- NEVER fabricate experience, metrics, or technologies
- Maintain chronological and factual accuracy
- If original bullet is vague, improve clarity but don't invent details
- Remove bullets that are completely irrelevant to target job
- Return 2-6 bullets (even if original has more)
`;

export const tailorExperienceEntryTool = tool({
  description:
    "Tailor a specific work experience entry based on the job description. Returns improved bullet points.",
  inputSchema: z.object({
    jobTitle: z.string().describe("Target job title"),
    jobDescription: z.string().describe("Target job description"),
    experienceId: z.string().describe("ID of the experience entry to tailor"),
  }),
  outputSchema: TailoredExperienceOutputSchema,
  strict: true,
  execute: async ({ jobTitle, jobDescription, experienceId }) => {
    const session = await checkAuth();
    if (!session) throw new Error("Unauthorized");

    const profile = await getFullProfile(session.user.id);
    if (!profile) throw new Error("Profile not found");

    const experience = profile.workExperiences.find(
      (exp) => exp.id === experienceId
    );
    if (!experience) throw new Error("Experience entry not found");

    const prompt = `
TARGET JOB TITLE: ${jobTitle}
JOB DESCRIPTION:
${jobDescription}

CANDIDATE EXPERIENCE:
Role: ${experience.position}
Company: ${experience.company}
Current Bullets:
${experience.bullets.map((b) => `- ${b}`).join("\n")}
`;

    const { output } = await generateText({
      model: RESUME_ANALYZER_MODEL,
      output: Output.object({
        schema: TailoredExperienceOutputSchema,
      }),
      system: TAILOR_EXPERIENCE_PROMPT,
      prompt,
    });

    // Ensure we explicitly verify the experienceId matches before returning
    return {
      ...output,
      experienceId, // Override to ensure correctness
      originalRole: experience.position,
      originalCompany: experience.company,
      originalBullets: experience.bullets,
      stepCompleted: "tailor_experience" as const,
    };
  },
});

export const approveExperienceEntryTool = tool({
  description:
    "Show the approval form for the tailored experience entry. Call this immediately after tailorExperienceEntryTool completes.",
  inputSchema: z.object({}),
  outputSchema: ExperienceApprovalSchema,
});

export type TailorExperienceEntryTool = typeof tailorExperienceEntryTool;
export type ApproveExperienceEntryTool = typeof approveExperienceEntryTool;
