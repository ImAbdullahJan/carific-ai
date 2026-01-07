"use server";

import prisma from "@/lib/prisma";
import type { ResumeTailorAgentUIMessage } from "@/ai/agent";
import {
  mapUIMessagePartsToDBParts,
  mapDBPartToUIMessagePart,
} from "@/lib/utils/tailoring-message-mapping";

/**
 * Creates a new tailoring chat session for a resume.
 */
export async function createTailoringChat(resumeId: string): Promise<string> {
  const chat = await prisma.tailoringChat.create({
    data: { resumeId },
  });
  return chat.id;
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

  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role as ResumeTailorAgentUIMessage["role"],
    parts: msg.parts.map(mapDBPartToUIMessagePart),
  }));
}

/**
 * Gets all tailoring chats for a resume.
 */
export async function getChatsForResume(resumeId: string) {
  return prisma.tailoringChat.findMany({
    where: { resumeId },
    orderBy: { createdAt: "desc" },
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

/**
 * Gets the most recent chat for a resume, or null if none exists.
 */
export async function getMostRecentChat(resumeId: string) {
  return prisma.tailoringChat.findFirst({
    where: { resumeId },
    orderBy: { createdAt: "desc" },
  });
}
