"use server";

import { revalidatePath } from "next/cache";
import { checkAuth } from "@/lib/auth-check";
import { getChatWithOwner } from "@/lib/db/tailoring-chat";
import {
  completeStep as dbCompleteStep,
  skipStep as dbSkipStep,
  startStep as dbStartStep,
  getPlanSteps,
} from "@/lib/db/tailoring-chat";
import type { DBPlanStep } from "@/lib/db/tailoring-chat";

async function validateChatAccess(chatId: string): Promise<boolean> {
  const session = await checkAuth();
  if (!session) return false;

  const chat = await getChatWithOwner(chatId);
  if (!chat) return false;

  return chat.resume.profile.userId === session.user.id;
}

export async function completeStep(
  chatId: string,
  stepId: string
): Promise<{ success: boolean; steps?: DBPlanStep[] }> {
  const hasAccess = await validateChatAccess(chatId);
  if (!hasAccess) {
    return { success: false };
  }

  try {
    await dbCompleteStep(chatId, stepId);
    const steps = await getPlanSteps(chatId);
    return { success: true, steps };
  } catch (error) {
    console.error("Failed to complete step:", error);
    return { success: false };
  }
}

/**
 * Skips a step and its corresponding approval step (if applicable).
 * For example, skipping "tailor_summary" also skips "approve_summary".
 * Skipping "tailor_exp_123" also skips "approve_exp_123".
 */
export async function skipStep(
  chatId: string,
  stepId: string
): Promise<{ success: boolean; steps?: DBPlanStep[] }> {
  const hasAccess = await validateChatAccess(chatId);
  if (!hasAccess) {
    return { success: false };
  }

  try {
    // Skip the requested step
    await dbSkipStep(chatId, stepId);

    // Also skip the corresponding approval step if this is a tailor step
    let approvalStepId: string | null = null;
    if (stepId === "tailor_summary") {
      approvalStepId = "approve_summary";
    } else if (stepId === "tailor_skills") {
      approvalStepId = "approve_skills";
    } else if (stepId.startsWith("tailor_exp_")) {
      // Extract experience ID and build approval step ID
      const expId = stepId.replace("tailor_exp_", "");
      approvalStepId = `approve_exp_${expId}`;
    }

    if (approvalStepId) {
      try {
        await dbSkipStep(chatId, approvalStepId);
      } catch {
        // Approval step might not exist, ignore error
      }
    }

    const steps = await getPlanSteps(chatId);
    return { success: true, steps };
  } catch (error) {
    console.error("Failed to skip step:", error);
    return { success: false };
  }
}

export async function startStep(
  chatId: string,
  stepId: string
): Promise<{ success: boolean; steps?: DBPlanStep[] }> {
  const hasAccess = await validateChatAccess(chatId);
  if (!hasAccess) {
    return { success: false };
  }

  try {
    await dbStartStep(chatId, stepId);
    const steps = await getPlanSteps(chatId);
    return { success: true, steps };
  } catch (error) {
    console.error("Failed to start step:", error);
    return { success: false };
  }
}

export async function refreshPlanSteps(
  chatId: string
): Promise<{ success: boolean; steps?: DBPlanStep[] }> {
  const hasAccess = await validateChatAccess(chatId);
  if (!hasAccess) {
    return { success: false };
  }

  try {
    const steps = await getPlanSteps(chatId);
    return { success: true, steps };
  } catch (error) {
    console.error("Failed to refresh plan steps:", error);
    return { success: false };
  }
}
