"use server";

import prisma from "@/lib/prisma";
import type { TailoringStepStatus } from "@/lib/generated/prisma/client";
import type { ResumeTailorAgentUIMessage } from "@/ai/agent";
import type { PlanStep } from "@/ai/tool/resume-tailor/schemas";
import {
  mapUIMessagePartsToDBParts,
  mapDBPartToUIMessagePart,
} from "@/lib/utils/tailoring-message-mapping";

/**
 * Creates a new tailoring chat session for a resume.
 * Note: With 1:1 relationship, this should only be called once per resume.
 */
export async function createTailoringChat(resumeId: string): Promise<string> {
  const chat = await prisma.tailoringChat.create({
    data: { resumeId },
  });
  return chat.id;
}

/**
 * Gets or creates a tailoring chat for a resume (1:1 relationship).
 */
export async function getOrCreateChatForResume(
  resumeId: string,
): Promise<string> {
  const existingChat = await getChatForResume(resumeId);
  if (existingChat) {
    return existingChat.id;
  }
  return createTailoringChat(resumeId);
}

/**
 * Upserts a message with its parts using atomic transaction.
 * If the message exists, it updates it and replaces all parts.
 * If it doesn't exist, it creates a new message with parts.
 */
export async function upsertMessage({
  chatId,
  id,
  message,
}: {
  chatId: string;
  id: string;
  message: ResumeTailorAgentUIMessage;
}): Promise<void> {
  // Skip messages with no parts (invalid state)
  if (!message.parts || message.parts.length === 0) {
    console.warn(`Skipping message ${id} with no parts`);
    return;
  }

  const mappedParts = mapUIMessagePartsToDBParts(message.parts, id);

  await prisma.$transaction(async (tx) => {
    // Upsert the message
    await tx.tailoringMessage.upsert({
      where: { id },
      create: {
        id,
        chatId,
        role: message.role,
      },
      update: {
        role: message.role,
      },
    });

    // Delete existing parts for this message
    await tx.tailoringMessagePart.deleteMany({
      where: { messageId: id },
    });

    // Insert new parts if any
    if (mappedParts.length > 0) {
      await tx.tailoringMessagePart.createMany({
        data: mappedParts,
      });
    }
  });
}

/**
 * Loads all messages for a chat, reconstructing UIMessages from DB.
 * Filters out messages with no parts (invalid state).
 */
export async function loadChat(
  chatId: string,
): Promise<ResumeTailorAgentUIMessage[]> {
  const messages = await prisma.tailoringMessage.findMany({
    where: { chatId },
    include: {
      parts: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return messages
    .filter((msg) => msg.parts.length > 0) // Filter out messages with no parts
    .map((msg) => ({
      id: msg.id,
      role: msg.role as ResumeTailorAgentUIMessage["role"],
      parts: msg.parts.map(mapDBPartToUIMessagePart),
    }));
}

/**
 * Gets the tailoring chat for a resume (1:1 relationship).
 */
export async function getChatForResume(resumeId: string) {
  return prisma.tailoringChat.findUnique({
    where: { resumeId },
  });
}

/**
 * Gets a single chat by ID.
 */
export async function getChat(chatId: string) {
  return prisma.tailoringChat.findUnique({
    where: { id: chatId },
  });
}

/**
 * Gets a single chat by ID including the owner's userId.
 * Used for authorization checks.
 */
export async function getChatWithOwner(chatId: string) {
  return prisma.tailoringChat.findUnique({
    where: { id: chatId },
    include: {
      resume: {
        include: {
          profile: {
            select: {
              userId: true,
            },
          },
        },
      },
    },
  });
}

/**
 * Deletes a chat and all its messages (cascade).
 */
export async function deleteChat(chatId: string): Promise<void> {
  await prisma.tailoringChat.delete({
    where: { id: chatId },
  });
}

/**
 * Deletes a message and all subsequent messages in the chat.
 * Useful for "edit and regenerate" functionality.
 */
export async function deleteMessageAndSubsequent(
  messageId: string,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Find the target message
    const targetMessage = await tx.tailoringMessage.findUnique({
      where: { id: messageId },
    });

    if (!targetMessage) return;

    // Delete all messages from this point forward
    await tx.tailoringMessage.deleteMany({
      where: {
        chatId: targetMessage.chatId,
        createdAt: { gte: targetMessage.createdAt },
      },
    });
  });
}

// ============================================================
// Plan Management Functions
// ============================================================

export interface DBPlanStep {
  id: string;
  stepId: string;
  type: string;
  label: string;
  description: string | null;
  order: number;
  experienceId: string | null;
  status: TailoringStepStatus;
}

/**
 * Creates plan steps in the database from the tool output.
 * Deletes any existing steps for this chat first (fresh plan).
 */
export async function savePlanSteps(
  chatId: string,
  steps: PlanStep[],
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Delete existing plan steps for this chat
    await tx.tailoringPlanStep.deleteMany({
      where: { chatId },
    });

    // Create new plan steps
    await tx.tailoringPlanStep.createMany({
      data: steps.map((step, index) => ({
        chatId,
        stepId: step.id,
        type: step.type,
        label: step.label,
        description: step.description ?? null,
        order: index,
        experienceId: step.context?.experienceId ?? null,
        status: "pending" as TailoringStepStatus,
      })),
    });
  });
}

/**
 * Gets all plan steps for a chat, ordered by their sequence.
 */
export async function getPlanSteps(chatId: string): Promise<DBPlanStep[]> {
  return prisma.tailoringPlanStep.findMany({
    where: { chatId },
    orderBy: { order: "asc" },
  });
}

/**
 * Updates the status of a specific plan step.
 */
export async function updateStepStatus(
  chatId: string,
  stepId: string,
  status: TailoringStepStatus,
): Promise<void> {
  // Use updateMany instead of update to avoid throwing when a stepId is missing.
  // This is a "best-effort" update that is resilient to AI agent hallucinations.
  await prisma.tailoringPlanStep.updateMany({
    where: { chatId, stepId },
    data: { status },
  });
}

/**
 * Marks a step as completed.
 */
export async function completeStep(
  chatId: string,
  stepId: string,
): Promise<void> {
  await updateStepStatus(chatId, stepId, "completed");
}

/**
 * Marks a step as skipped.
 */
export async function skipStep(chatId: string, stepId: string): Promise<void> {
  await updateStepStatus(chatId, stepId, "skipped");
}

/**
 * Marks a step as in progress.
 */
export async function startStep(chatId: string, stepId: string): Promise<void> {
  await updateStepStatus(chatId, stepId, "in_progress");
}

/**
 * Gets the next pending step in the plan.
 */
export async function getNextPendingStep(
  chatId: string,
): Promise<DBPlanStep | null> {
  return prisma.tailoringPlanStep.findFirst({
    where: {
      chatId,
      status: "pending",
    },
    orderBy: { order: "asc" },
  });
}

/**
 * Gets plan progress statistics.
 */
export async function getPlanProgress(chatId: string): Promise<{
  total: number;
  completed: number;
  skipped: number;
  pending: number;
  inProgress: number;
}> {
  const steps = await getPlanSteps(chatId);
  return {
    total: steps.length,
    completed: steps.filter((s) => s.status === "completed").length,
    skipped: steps.filter((s) => s.status === "skipped").length,
    pending: steps.filter((s) => s.status === "pending").length,
    inProgress: steps.filter((s) => s.status === "in_progress").length,
  };
}

/**
 * Updates the target job details for a chat.
 */
export async function updateTargetJob(
  chatId: string,
  jobTitle: string,
  jobDescription: string,
): Promise<void> {
  await prisma.tailoringChat.update({
    where: { id: chatId },
    data: {
      targetJobTitle: jobTitle,
      targetJobDescription: jobDescription,
    },
  });
}

/**
 * Gets the target job details for a chat.
 */
export async function getTargetJob(
  chatId: string,
): Promise<{ title: string | null; description: string | null }> {
  const chat = await prisma.tailoringChat.findUnique({
    where: { id: chatId },
    select: {
      targetJobTitle: true,
      targetJobDescription: true,
    },
  });
  return {
    title: chat?.targetJobTitle ?? null,
    description: chat?.targetJobDescription ?? null,
  };
}
