import { generateText, Output, tool } from "ai";
import { z } from "zod";

import { RESUME_ANALYZER_MODEL } from "@/ai/constants";
import { checkAuth } from "@/lib/auth-check";
import { getFullProfile } from "@/lib/db/profile";

import { TailoredSkillsOutputSchema, SkillsApprovalSchema } from "./schemas";

const TAILOR_SKILLS_PROMPT = `
You are an expert resume writer specializing in ATS optimization.

## Your Task
Analyze the candidate's skills and reorganize them for the target job.

## Strategy
1. **Analyze Requirements**: Extract required skills/keywords from the job description
2. **Match & Categorize**:
   - Match candidate's skills to requirements
   - Categorize each skill by relevance:
     - "high": Directly mentioned in JD or critical for the role
     - "medium": Related or transferable skill
     - "low": Not relevant to this specific role (but maybe keep if valuable)
3. **Reorganize**:
   - Suggest better category groupings (e.g., "Programming Languages", "Cloud Infrastructure", "Soft Skills") if current ones are weak
   - Reorder skills within categories: most relevant first
4. **Identify Gaps**:
   - Suggest 2-3 MISSING skills IF and ONLY IF the candidate likely has them based on their profile but didn't list them.
   - Mark these as "isNew: true"
5. **Document Logic**: Explain why you reorganized them this way.

## Critical Rules
- Do NOT remove skills unless they are completely irrelevant or actively harmful
- Do NOT invent skills the candidate clearly doesn't have
- Respect the candidate's proficiency levels if known (implied)
`;

export const tailorSkillsTool = tool({
  description:
    "Analyze and reorganize the user's skills for relevance to the job description. Returns categorized and scored skills.",
  inputSchema: z.object({
    jobTitle: z.string().describe("Target job title"),
    jobDescription: z.string().describe("Target job description"),
  }),
  outputSchema: TailoredSkillsOutputSchema,
  strict: true,
  execute: async ({ jobTitle, jobDescription }) => {
    const session = await checkAuth();
    if (!session) throw new Error("Unauthorized");

    const profile = await getFullProfile(session.user.id);
    if (!profile) throw new Error("Profile not found");

    const currentSkills = profile.skills.map((s) => ({
      name: s.name,
      category: s.category,
    }));

    if (currentSkills.length === 0) {
      // If no skills, return empty/default structure
      return {
        originalSkills: [],
        suggestedSkills: [],
        reasoning: "No skills found in profile.",
        improvements: [],
        keywordsMatched: [],
        stepCompleted: "tailor_skills" as const,
      };
    }

    const prompt = `
TARGET JOB TITLE: ${jobTitle}
JOB DESCRIPTION:
${jobDescription}

CANDIDATE SKILLS:
${JSON.stringify(currentSkills, null, 2)}
`;

    const { output } = await generateText({
      model: RESUME_ANALYZER_MODEL,
      output: Output.object({
        schema: TailoredSkillsOutputSchema,
      }),
      system: TAILOR_SKILLS_PROMPT,
      prompt,
    });

    return {
      ...output,
      originalSkills: currentSkills,
      stepCompleted: "tailor_skills" as const,
    };
  },
});

export const approveSkillsTool = tool({
  description:
    "Show the approval form for the tailored skills. Call this immediately after tailorSkillsTool completes.",
  inputSchema: z.object({}),
  outputSchema: SkillsApprovalSchema,
});

export type TailorSkillsTool = typeof tailorSkillsTool;
export type ApproveSkillsTool = typeof approveSkillsTool;
