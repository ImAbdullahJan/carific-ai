"use server";

import prisma from "@/lib/prisma";
import type { ResumeData } from "@/lib/types/resume";
import type { ResumeTailorAgentUIMessage } from "@/ai/agent";

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

/**
 * Updates the content of a resume with a partial update.
 * Performs a deep merge at the top level.
 */
export async function updateResumeContent(
  resumeId: string,
  partialContent: Partial<ResumeData>
) {
  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    select: { content: true },
  });

  if (!resume) throw new Error("Resume not found");

  const currentContent = resume.content as unknown as ResumeData;

  const newContent = {
    ...currentContent,
    ...partialContent,
  };

  await prisma.resume.update({
    where: { id: resumeId },
    data: { content: newContent },
  });
}

/**
 * Applies approved changes from the resume tailor agent to the resume content.
 * This function parses the tool outputs and updates the resume content accordingly.
 */
export async function applyApprovedChanges(
  resumeId: string,
  responseMessage: ResumeTailorAgentUIMessage,
  allMessages: ResumeTailorAgentUIMessage[]
) {
  const parts = responseMessage.parts;
  const updates: Partial<ResumeData> = {};
  let hasUpdates = false;

  // We might need current content for array updates
  let currentContent: ResumeData | null = null;
  const getCurrentContent = async () => {
    if (currentContent) return currentContent;
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      select: { content: true },
    });
    if (!resume) throw new Error("Resume not found");
    currentContent = resume.content as unknown as ResumeData;
    return currentContent;
  };

  for (const part of parts) {
    // 1. Handle Summary Approval
    if (
      part.type === "tool-approveSummary" &&
      part.state === "output-available"
    ) {
      const output = part.output; // Type alias for tool output
      if (output.approved) {
        // If there's custom text, use it.
        // Otherwise we need to find the suggested text from the tailoring step
        let bio = output.customText;
        if (!bio) {
          // Find the tailorSummary tool output
          // Iterate backwards to find the most recent tailorSummary
          for (let i = allMessages.length - 1; i >= 0; i--) {
            const msg = allMessages[i];
            const summaryPart = msg.parts.find(
              (p) =>
                p.type === "tool-tailorSummary" &&
                p.state === "output-available"
            );
            if (summaryPart) {
              bio = summaryPart.output.suggested;
              break;
            }
          }
        }

        if (bio) {
          updates.bio = bio;
          hasUpdates = true;
        }
      }
    }

    // 2. Handle Skills Approval
    if (
      part.type === "tool-approveSkills" &&
      part.state === "output-available"
    ) {
      const output = part.output;
      if (output.approved && output.finalSkills) {
        // Map to simpler ResumeData skill format (no ID/order usually needed if just string lists, but ResumeData has structure)
        // ResumeData.skills: { name, category, level }[]
        updates.skills = output.finalSkills.map((s) => ({
          name: s.name,
          category: s.category || "Hard", // Default or preserve?
          level: null,
        }));
        hasUpdates = true;
      }
    }

    // 3. Handle Experience Approval
    if (
      part.type === "tool-approveExperienceEntry" &&
      part.state === "output-available"
    ) {
      const output = part.output;
      if (output.approved) {
        const experienceId = output.experienceId; // This is the ID from the tailoring process

        // Ideally we have the originalCompany/Role from the tool output
        // We need to look up the CORRESPONDING tailorExperienceEntry tool call
        // The one that has the same experienceId
        let originalCompany: string | undefined;
        let originalRole: string | undefined;
        let suggestedBullets: string[] | undefined;

        for (const msg of allMessages) {
          for (const p of msg.parts) {
            if (
              p.type === "tool-tailorExperienceEntry" &&
              p.state === "output-available" &&
              p.output.experienceId === experienceId
            ) {
              const out = p.output;
              originalCompany = out.originalCompany;
              originalRole = out.originalRole;
              suggestedBullets = out.suggestedBullets;
            }
          }
        }

        const finalBullets = output.finalBullets || suggestedBullets;

        if (originalCompany && originalRole && finalBullets) {
          const content = await getCurrentContent();

          // Apply the update to the 'updates' object if it exists (accumulating),
          // or base it on current content if this is the first experience in the batch.
          const experiencesToUpdate =
            updates.workExperiences || content.workExperiences;

          updates.workExperiences = experiencesToUpdate.map((exp) => {
            if (
              exp.company === originalCompany &&
              exp.position === originalRole
            ) {
              return { ...exp, bullets: finalBullets };
            }
            return exp;
          });

          hasUpdates = true;
        }
      }
    }
  }

  if (hasUpdates) {
    await updateResumeContent(resumeId, updates);
  }
}
