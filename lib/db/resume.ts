"use server";

import prisma from "@/lib/prisma";
import type { ResumeData } from "@/lib/types/resume";

/**
 * Gets all resumes for a user's profile
 */
export async function getResumesForProfile(profileId: string) {
  return prisma.resume.findMany({
    where: { profileId },
    include: {
      tailoringChat: {
        include: {
          _count: {
            select: { messages: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Gets a single resume by ID with its chat
 */
export async function getResumeById(resumeId: string) {
  return prisma.resume.findUnique({
    where: { id: resumeId },
    include: {
      tailoringChat: true,
    },
  });
}

/**
 * Creates a new resume for a user profile
 */
export async function createResume(
  profileId: string,
  title: string,
  content: ResumeData
) {
  return prisma.resume.create({
    data: {
      profileId,
      title,
      content: content,
    },
  });
}

/**
 * Deletes a resume and its associated chat (cascade)
 */
export async function deleteResume(resumeId: string) {
  return prisma.resume.delete({
    where: { id: resumeId },
  });
}
