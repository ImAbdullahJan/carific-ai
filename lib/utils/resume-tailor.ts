import { UIToolInvocation } from "ai";
import type { ResumeTailorAgentUIMessage } from "@/ai/agent";
import type {
  TailoredExperienceOutput,
  TailoringPlan,
} from "@/ai/tool/resume-tailor";
import { approveExperienceEntryTool } from "@/ai/tool/resume-tailor";

/**
 * Helper function to get experience name from plan by experience ID
 */
export function getExperienceNameFromPlan(
  experienceId: string | undefined,
  plan: TailoringPlan | null
): string {
  if (!experienceId || !plan) return "experience";
  const step = plan.steps.find(
    (s) =>
      s.type === "tailor_experience" && s.context?.experienceId === experienceId
  );
  // Label format is "Tailor: Position @ Company" - extract the part after "Tailor: "
  if (step?.label) {
    return step.label.replace("Tailor: ", "").replace(" @ ", " at ");
  }
  return "experience";
}

/**
 * Helper function to find the experience data for an approval step
 * @param part - The approval tool part
 * @param tailoredExperiences - Map of tailored experiences by ID
 * @param messages - All messages up to current point
 * @param currentMsg - The current message being rendered
 * @returns The experience data to display, or undefined if not found
 */
export function findExperienceForApproval(
  part: UIToolInvocation<typeof approveExperienceEntryTool>,
  tailoredExperiences: Record<string, TailoredExperienceOutput>,
  messages: ResumeTailorAgentUIMessage[],
  currentMsg: ResumeTailorAgentUIMessage
): TailoredExperienceOutput | undefined {
  if (part.state === "output-available") {
    // Approval completed - get experience data using the ID from output
    const expId = part.output.experienceId;
    return tailoredExperiences[expId];
  }

  // Approval in progress - find the most recently tailored experience
  // that hasn't been approved yet by checking message history
  const allMessages = messages.slice(0, messages.indexOf(currentMsg) + 1);
  const approvedExpIds = new Set<string>();

  // Collect all approved experience IDs from previous messages
  for (const m of allMessages) {
    for (const p of m.parts) {
      if (
        p.type === "tool-approveExperienceEntry" &&
        p.state === "output-available"
      ) {
        approvedExpIds.add(p.output.experienceId);
      } else if (p.type === "tool-skipStep" && p.state === "output-available") {
        // Also track skipped approvals so we don't show them again
        const idsToCheck = [p.output.stepId, p.output.relatedStepId];
        for (const id of idsToCheck) {
          if (id && id.startsWith("approve_exp_")) {
            approvedExpIds.add(id.replace("approve_exp_", ""));
          }
        }
      }
    }
  }

  // Find the first tailored experience that hasn't been approved
  const unapprovedExpId = Object.keys(tailoredExperiences).find(
    (expId) => !approvedExpIds.has(expId)
  );

  return unapprovedExpId ? tailoredExperiences[unapprovedExpId] : undefined;
}
