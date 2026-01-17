import type { ResumeTailorAgentUIMessage } from "@/ai/agent";
import type {
  TailoredExperienceOutput,
  TailoredSummaryOutput,
  TailoredSkillsOutput,
  TailoringPlan,
} from "@/ai/tool/resume-tailor";
import type { ResumeData } from "@/lib/types/resume";
import type { DBPlanStep } from "@/lib/db/tailoring-chat";

export interface ApprovedChanges {
  summary?: { approved: boolean; text?: string };
  experiences?: Record<string, { approved: boolean; bullets?: string[] }>;
  skills?: {
    approved: boolean;
    finalSkills?: { name: string; category: string }[];
  };
}

export interface TailoredData {
  summary: TailoredSummaryOutput | null;
  experiences: Record<string, TailoredExperienceOutput>;
  skills: TailoredSkillsOutput | null;
}

export interface TailorState {
  plan: TailoringPlan | null;
  planSteps: DBPlanStep[];
  tailoredData: TailoredData;
  approvedChanges: ApprovedChanges;
  previewData: ResumeData;
  hasPendingApproval: boolean;
}

/**
 * Pure reducer function to derive the entire application state from the chat history.
 * This ensures consistency: the UI always reflects exactly what is in the chat.
 */
export function deriveTailorState(
  messages: ResumeTailorAgentUIMessage[],
  initialProfile: ResumeData
): TailorState {
  let plan: TailoringPlan | null = null;
  let summary: TailoredSummaryOutput | null = null;
  let skills: TailoredSkillsOutput | null = null;
  const experiences: Record<string, TailoredExperienceOutput> = {};

  const approvedSummary: ApprovedChanges["summary"] = { approved: false };
  const approvedExperiences: NonNullable<ApprovedChanges["experiences"]> = {};
  const approvedSkills: ApprovedChanges["skills"] = { approved: false };

  // Track step statuses
  const completedStepIds = new Set<string>();
  const inProgressStepIds = new Set<string>();
  const skippedStepIds = new Set<string>();

  // pending approval check
  let hasPendingApproval = false;
  if (messages.length > 0) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "assistant") {
      hasPendingApproval = lastMessage.parts.some(
        (part) =>
          (part.type === "tool-approveSummary" ||
            part.type === "tool-approveExperienceEntry" ||
            part.type === "tool-approveSkills" ||
            part.type === "tool-collectJobDetails" ||
            part.type === "tool-skipStep") &&
          (part.state === "approval-requested" ||
            part.state === "input-available")
      );
    }
  }

  // First Pass: Extract Data & Statuses
  for (const msg of messages) {
    for (const part of msg.parts) {
      // --- 1. Extract Data from Tool Outputs ---
      if (part.type === "tool-createTailoringPlan" && part.output) {
        plan = part.output; // Last plan wins (if regenerated)
      } else if (part.type === "tool-tailorSummary" && part.output) {
        summary = part.output;
      } else if (part.type === "tool-tailorSkills" && part.output) {
        skills = part.output;
      } else if (part.type === "tool-tailorExperienceEntry" && part.output) {
        experiences[part.output.experienceId] = part.output;
      }

      // --- 2. Extract Approvals ---
      else if (part.type === "tool-approveSummary" && part.output) {
        approvedSummary.approved = part.output.approved;
        approvedSummary.text = part.output.customText ?? undefined;
      } else if (part.type === "tool-approveSkills" && part.output) {
        approvedSkills.approved = part.output.approved;
        approvedSkills.finalSkills = part.output.finalSkills;
      } else if (part.type === "tool-approveExperienceEntry" && part.output) {
        approvedExperiences[part.output.experienceId] = {
          approved: part.output.approved,
          bullets: part.output.finalBullets,
        };
      }

      // --- 3. Track Step Statuses ---
      if (!part.type.startsWith("tool-")) continue;

      let stepId: string | null = null;
      if (part.type === "tool-collectJobDetails") stepId = "collect_jd";
      else if (part.type === "tool-tailorSummary") stepId = "tailor_summary";
      else if (part.type === "tool-approveSummary") stepId = "approve_summary";
      else if (part.type === "tool-tailorSkills") stepId = "tailor_skills";
      else if (part.type === "tool-approveSkills") stepId = "approve_skills";
      else if (part.type === "tool-tailorExperienceEntry") {
        const expId =
          part.state === "output-available"
            ? part.output.experienceId
            : part.input?.experienceId;
        if (expId) stepId = `tailor_exp_${expId}`;
      } else if (part.type === "tool-approveExperienceEntry") {
        const expId =
          part.state === "output-available"
            ? part.output.experienceId
            : part.input?.experienceId;
        if (expId) stepId = `approve_exp_${expId}`;
      } else if (
        part.type === "tool-skipStep" &&
        part.state === "output-available"
      ) {
        skippedStepIds.add(part.output.stepId);
        if (part.output.relatedStepId) {
          skippedStepIds.add(part.output.relatedStepId);
        }
        continue;
      }

      if (!stepId) continue;

      if ("state" in part && part.state === "output-available") {
        completedStepIds.add(stepId);
      } else if (
        "state" in part &&
        (part.state === "streaming" ||
          part.state === "input-streaming" ||
          part.state === "input-available" ||
          part.state === "approval-requested")
      ) {
        inProgressStepIds.add(stepId);
      }
    }
  }

  // Second Pass: Compute Derived States

  // 1. Plan Steps
  const planSteps: DBPlanStep[] =
    plan?.steps.map((step, index) => {
      let status: DBPlanStep["status"] = "pending";
      if (skippedStepIds.has(step.id)) status = "skipped";
      else if (completedStepIds.has(step.id)) status = "completed";
      else if (inProgressStepIds.has(step.id)) status = "in_progress";

      return {
        id: step.id,
        stepId: step.id,
        type: step.type,
        label: step.label,
        description: step.description ?? null,
        order: index,
        experienceId: step.context?.experienceId ?? null,
        status,
      };
    }) || [];

  // 2. Preview Data
  const preview = { ...initialProfile };

  // Apply approved summary
  if (approvedSummary.approved) {
    // If approved but no text, use suggested
    const textToUse = approvedSummary.text || summary?.suggested;
    if (textToUse) preview.bio = textToUse;
  }

  // Apply approved skills
  if (approvedSkills.approved && approvedSkills.finalSkills) {
    preview.skills = approvedSkills.finalSkills.map((s) => ({
      name: s.name,
      category: s.category,
      level: null,
    }));
  }

  // Apply approved experiences
  if (Object.keys(approvedExperiences).length > 0) {
    preview.workExperiences = preview.workExperiences.map((exp) => {
      // Find matching tailored experience ID
      // We look for a tailored experience that matches this profile experience's company/role
      const matchingExpId = Object.keys(experiences).find((tId) => {
        const tExp = experiences[tId];
        return (
          tExp.originalCompany === exp.company &&
          tExp.originalRole === exp.position
        );
      });

      if (matchingExpId) {
        const approval = approvedExperiences[matchingExpId];
        if (approval && approval.approved) {
          // Use final bullets if available, else suggested
          const bulletsToUse =
            approval.bullets || experiences[matchingExpId].suggestedBullets;
          return { ...exp, bullets: bulletsToUse };
        }
      }
      return exp;
    });
  }

  return {
    plan,
    planSteps,
    tailoredData: { summary, experiences, skills },
    approvedChanges: {
      summary: approvedSummary,
      experiences: approvedExperiences,
      skills: approvedSkills,
    },
    previewData: preview,
    hasPendingApproval,
  };
}
