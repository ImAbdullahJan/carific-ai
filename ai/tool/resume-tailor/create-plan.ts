import { tool } from "ai";
import { z } from "zod";

import { checkAuth } from "@/lib/auth-check";
import { getFullProfile } from "@/lib/db/profile";

import { PlanStep, TailoringPlanSchema } from "./schemas";

export const createTailoringPlanTool = tool({
  description:
    "Create a tailoring plan for the user's resume. Call this immediately on the first user message. No need to analyze user intent - just call it.",
  inputSchema: z.object({}),
  outputSchema: TailoringPlanSchema,
  execute: async () => {
    const session = await checkAuth();
    if (!session) throw new Error("Unauthorized");

    const profile = await getFullProfile(session.user.id);
    if (!profile) throw new Error("Profile not found");

    const steps: PlanStep[] = [
      {
        id: "collect_jd",
        type: "collect_jd" as const,
        label: "Collect Job Details",
        description: "Get the job title and description from you",
      },
      {
        id: "tailor_summary",
        type: "tailor_summary" as const,
        label: "Tailor Summary",
        description: "Generate a tailored professional summary",
      },
      {
        id: "approve_summary",
        type: "approve_summary" as const,
        label: "Review Summary",
        description: "Review and approve the suggested summary",
      },
    ];

    // Add steps for each work experience
    if (profile.workExperiences && profile.workExperiences.length > 0) {
      profile.workExperiences.forEach((exp) => {
        // Experience Tailoring Step
        steps.push({
          id: `tailor_exp_${exp.id}`,
          type: "tailor_experience" as const,
          label: `Tailor: ${exp.position} @ ${exp.company}`,
          description: "Optimize experience bullets for relevance",
          context: { experienceId: exp.id },
        });

        // Experience Approval Step
        steps.push({
          id: `approve_exp_${exp.id}`,
          type: "approve_experience" as const,
          label: `Review: ${exp.position}`,
          description: "Approve changes for this role",
          context: { experienceId: exp.id },
        });
      });
    }

    // Add steps for skills tailoring
    if (profile.skills && profile.skills.length > 0) {
      steps.push({
        id: "tailor_skills",
        type: "tailor_skills" as const,
        label: "Tailor Skills",
        description: "Reorganize skills for relevance",
      });
      steps.push({
        id: "approve_skills",
        type: "approve_skills" as const,
        label: "Review Skills",
        description: "Approve skill changes",
      });
    }

    return {
      steps,
      targetJob: {
        title: null,
        description: null,
      },
    };
  },
});
