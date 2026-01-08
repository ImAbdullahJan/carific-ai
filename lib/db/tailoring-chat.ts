"use server";

import prisma from "@/lib/prisma";
import type { ResumeTailorAgentUIMessage } from "@/ai/agent";
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
  resumeId: string
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
        chatId,
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
  chatId: string
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
  messageId: string
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
