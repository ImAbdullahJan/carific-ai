import { tool } from "ai";
import { z } from "zod";

import { checkAuth } from "@/lib/auth-check";
import { analyzeResume } from "@/ai/agent";
import { formatProfileForAnalysis } from "@/ai/utils/profile-text";
import { getFullProfile } from "@/lib/db/profile";

export const analyzeJobMatchTool = tool({
  description:
    "Analyze how well the user's profile matches a job description. Call this immediately after receiving job details from collectJobDetails.",
  inputSchema: z.object({
    jobTitle: z.string().describe("The job title from collectJobDetails"),
    jobDescription: z
      .string()
      .describe("The full job description text from collectJobDetails"),
  }),
  execute: async ({ jobTitle, jobDescription }) => {
    const session = await checkAuth();
    if (!session) {
      throw new Error("Unauthorized");
    }
    const profile = await getFullProfile(session.user.id);
    if (!profile) {
      throw new Error("No profile found. Please create your profile first.");
    }
    const profileText = formatProfileForAnalysis(profile);
    const output = await analyzeResume({
      resumeText: profileText,
      jobDescription,
      pageCount: undefined,
    });

    return {
      jobTitle,
      analysis: output,
    };
  },
});
