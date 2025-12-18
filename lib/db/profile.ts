import prisma from "@/lib/prisma";
import {
  type ResumeExtraction,
  type WorkExperienceExtraction,
  type VolunteerExperienceExtraction,
  type EducationExtraction,
  type ProjectExtraction,
  type SkillExtraction,
  type CertificationExtraction,
  type LanguageExtraction,
  type AchievementExtraction,
  type SocialLinkExtraction,
} from "@/lib/validations/resume-extraction";
import { parseExtractedDate } from "@/lib/ai/resume-extractor";

export interface SaveProfileResult {
  success: true;
  profileId: string;
}

export interface SaveProfileError {
  success: false;
  error: string;
}

export type SaveProfileResponse = SaveProfileResult | SaveProfileError;

/**
 * Creates or updates a user profile from extracted resume data
 *
 * @param userId - The authenticated user's ID
 * @param data - The extracted resume data
 * @returns The created/updated profile ID
 */
export async function saveExtractedProfile(
  userId: string,
  data: ResumeExtraction
): Promise<SaveProfileResponse> {
  try {
    // Use a transaction to ensure all data is saved atomically
    const profile = await prisma.$transaction(async (tx) => {
      // Check if user already has a profile
      const existingProfile = await tx.userProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      // If profile exists, delete all related data first (clean slate approach)
      if (existingProfile) {
        await Promise.all([
          tx.socialLink.deleteMany({
            where: { profileId: existingProfile.id },
          }),
          tx.workExperience.deleteMany({
            where: { profileId: existingProfile.id },
          }),
          tx.volunteerExperience.deleteMany({
            where: { profileId: existingProfile.id },
          }),
          tx.education.deleteMany({
            where: { profileId: existingProfile.id },
          }),
          tx.project.deleteMany({ where: { profileId: existingProfile.id } }),
          tx.userSkill.deleteMany({
            where: { profileId: existingProfile.id },
          }),
          tx.certification.deleteMany({
            where: { profileId: existingProfile.id },
          }),
          tx.language.deleteMany({
            where: { profileId: existingProfile.id },
          }),
          tx.achievement.deleteMany({
            where: { profileId: existingProfile.id },
          }),
        ]);
      }

      // Upsert the main profile
      const profile = await tx.userProfile.upsert({
        where: { userId },
        create: {
          userId,
          ...mapProfileFields(data),
        },
        update: {
          ...mapProfileFields(data),
        },
      });

      // Create all related entities in parallel
      await Promise.all([
        // Social Links
        data.socialLinks &&
          data.socialLinks.length > 0 &&
          tx.socialLink.createMany({
            data: mapSocialLinks(data.socialLinks, profile.id),
          }),

        // Work Experiences
        data.workExperiences.length > 0 &&
          tx.workExperience.createMany({
            data: mapWorkExperiences(data.workExperiences, profile.id),
          }),

        // Volunteer Experiences
        data.volunteerExperiences &&
          data.volunteerExperiences.length > 0 &&
          tx.volunteerExperience.createMany({
            data: mapVolunteerExperiences(
              data.volunteerExperiences,
              profile.id
            ),
          }),

        // Education
        data.educations.length > 0 &&
          tx.education.createMany({
            data: mapEducations(data.educations, profile.id),
          }),

        // Projects
        data.projects &&
          data.projects.length > 0 &&
          tx.project.createMany({
            data: mapProjects(data.projects, profile.id),
          }),

        // Skills
        data.skills.length > 0 &&
          tx.userSkill.createMany({
            data: mapSkills(data.skills, profile.id),
            skipDuplicates: true, // Handle unique constraint on [profileId, name]
          }),

        // Certifications
        data.certifications &&
          data.certifications.length > 0 &&
          tx.certification.createMany({
            data: mapCertifications(data.certifications, profile.id),
          }),

        // Languages
        data.languages &&
          data.languages.length > 0 &&
          tx.language.createMany({
            data: mapLanguages(data.languages, profile.id),
          }),

        // Achievements
        data.achievements &&
          data.achievements.length > 0 &&
          tx.achievement.createMany({
            data: mapAchievements(data.achievements, profile.id),
          }),
      ]);

      return profile;
    });

    return {
      success: true,
      profileId: profile.id,
    };
  } catch (error) {
    console.error("[ProfileService] Failed to save profile:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to save profile data. Please try again.",
    };
  }
}

// ============================================================
// MAPPING FUNCTIONS
// Convert extracted data to Prisma-compatible format
// ============================================================

function mapProfileFields(data: ResumeExtraction) {
  return {
    displayName: data.displayName,
    headline: data.headline,
    email: data.email,
    phone: data.phone,
    website: data.website,
    location: data.location,
    bio: data.bio,
    dateOfBirth: parseExtractedDate(data.dateOfBirth ?? null),
    gender: data.gender,
    nationality: data.nationality,
    maritalStatus: data.maritalStatus,
    visaStatus: data.visaStatus,
    hobbies: data.hobbies ?? [],
  };
}

function mapSocialLinks(links: SocialLinkExtraction[], profileId: string) {
  return links.map((link, index) => ({
    profileId,
    platform: link.platform.toLowerCase(),
    url: link.url,
    label: link.label,
    order: index,
  }));
}

function mapWorkExperiences(
  experiences: WorkExperienceExtraction[],
  profileId: string
) {
  return experiences.map((exp, index) => ({
    profileId,
    company: exp.company,
    position: exp.position,
    location: exp.location,
    startDate: parseExtractedDate(exp.startDate),
    endDate: parseExtractedDate(exp.endDate ?? null),
    current: exp.current,
    bullets: exp.bullets,
    order: index,
  }));
}

function mapVolunteerExperiences(
  experiences: VolunteerExperienceExtraction[],
  profileId: string
) {
  return experiences.map((exp, index) => ({
    profileId,
    organization: exp.organization,
    role: exp.role,
    location: exp.location,
    startDate: parseExtractedDate(exp.startDate ?? null),
    endDate: parseExtractedDate(exp.endDate ?? null),
    current: exp.current,
    bullets: exp.bullets,
    order: index,
  }));
}

function mapEducations(educations: EducationExtraction[], profileId: string) {
  return educations.map((edu, index) => ({
    profileId,
    school: edu.school,
    degree: edu.degree,
    fieldOfStudy: edu.fieldOfStudy,
    location: edu.location,
    startDate: parseExtractedDate(edu.startDate ?? null),
    endDate: parseExtractedDate(edu.endDate ?? null),
    current: edu.current,
    highlights: edu.highlights,
    order: index,
  }));
}

function mapProjects(projects: ProjectExtraction[], profileId: string) {
  return projects.map((project, index) => ({
    profileId,
    name: project.name,
    description: project.description,
    url: project.url,
    startDate: parseExtractedDate(project.startDate ?? null),
    endDate: parseExtractedDate(project.endDate ?? null),
    highlights: project.highlights,
    order: index,
  }));
}

function mapSkills(skills: SkillExtraction[], profileId: string) {
  return skills.map((skill, index) => ({
    profileId,
    name: skill.name,
    category: skill.category,
    level: skill.level,
    order: index,
  }));
}

function mapCertifications(
  certifications: CertificationExtraction[],
  profileId: string
) {
  return certifications.map((cert, index) => ({
    profileId,
    name: cert.name,
    issuer: cert.issuer,
    issueDate: parseExtractedDate(cert.issueDate ?? null),
    expiryDate: parseExtractedDate(cert.expiryDate ?? null),
    credentialId: cert.credentialId,
    credentialUrl: cert.credentialUrl,
    order: index,
  }));
}

function mapLanguages(languages: LanguageExtraction[], profileId: string) {
  return languages.map((lang, index) => ({
    profileId,
    name: lang.name,
    proficiency: lang.proficiency,
    order: index,
  }));
}

function mapAchievements(
  achievements: AchievementExtraction[],
  profileId: string
) {
  return achievements.map((achievement, index) => ({
    profileId,
    title: achievement.title,
    issuer: achievement.issuer,
    date: parseExtractedDate(achievement.date ?? null),
    description: achievement.description,
    order: index,
  }));
}

/**
 * Retrieves a user's complete profile with all related data
 */
export async function getFullProfile(userId: string) {
  return prisma.userProfile.findUnique({
    where: { userId },
    include: {
      socialLinks: { orderBy: { order: "asc" } },
      workExperiences: { orderBy: { order: "asc" } },
      volunteerExperiences: { orderBy: { order: "asc" } },
      educations: { orderBy: { order: "asc" } },
      projects: { orderBy: { order: "asc" } },
      skills: { orderBy: { order: "asc" } },
      certifications: { orderBy: { order: "asc" } },
      languages: { orderBy: { order: "asc" } },
      achievements: { orderBy: { order: "asc" } },
    },
  });
}

/**
 * Updates a user's profile with form data
 */
export async function updateProfile(
  userId: string,
  data: import("@/lib/validations/profile-update").ProfileUpdate
): Promise<SaveProfileResponse> {
  try {
    const profile = await prisma.$transaction(async (tx) => {
      // Get or create profile
      let existingProfile = await tx.userProfile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!existingProfile) {
        existingProfile = await tx.userProfile.create({
          data: {
            userId,
            displayName: data.displayName,
          },
          select: { id: true },
        });
      }

      const profileId = existingProfile.id;

      // Delete all related data first (clean slate for arrays)
      await Promise.all([
        tx.socialLink.deleteMany({ where: { profileId } }),
        tx.workExperience.deleteMany({ where: { profileId } }),
        tx.volunteerExperience.deleteMany({ where: { profileId } }),
        tx.education.deleteMany({ where: { profileId } }),
        tx.project.deleteMany({ where: { profileId } }),
        tx.userSkill.deleteMany({ where: { profileId } }),
        tx.certification.deleteMany({ where: { profileId } }),
        tx.language.deleteMany({ where: { profileId } }),
        tx.achievement.deleteMany({ where: { profileId } }),
      ]);

      // Update main profile
      const updatedProfile = await tx.userProfile.update({
        where: { id: profileId },
        data: {
          displayName: data.displayName,
          headline: data.headline || null,
          email: data.email || null,
          phone: data.phone || null,
          website: data.website || null,
          location: data.location || null,
          bio: data.bio || null,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
          gender: data.gender || null,
          nationality: data.nationality || null,
          maritalStatus: data.maritalStatus || null,
          visaStatus: data.visaStatus || null,
          hobbies: data.hobbies || [],
        },
      });

      // Create all related entities
      await Promise.all([
        data.socialLinks.length > 0 &&
          tx.socialLink.createMany({
            data: data.socialLinks.map((link, index) => ({
              profileId,
              platform: link.platform,
              url: link.url,
              label: link.label || null,
              order: index,
            })),
          }),

        data.workExperiences.length > 0 &&
          tx.workExperience.createMany({
            data: data.workExperiences.map((exp, index) => ({
              profileId,
              company: exp.company,
              position: exp.position,
              location: exp.location || null,
              startDate: exp.startDate ? new Date(exp.startDate) : null,
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              current: exp.current,
              bullets: exp.bullets,
              order: index,
            })),
          }),

        data.volunteerExperiences.length > 0 &&
          tx.volunteerExperience.createMany({
            data: data.volunteerExperiences.map((exp, index) => ({
              profileId,
              organization: exp.organization,
              role: exp.role,
              location: exp.location || null,
              startDate: exp.startDate ? new Date(exp.startDate) : null,
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              current: exp.current,
              bullets: exp.bullets,
              order: index,
            })),
          }),

        data.educations.length > 0 &&
          tx.education.createMany({
            data: data.educations.map((edu, index) => ({
              profileId,
              school: edu.school,
              degree: edu.degree,
              fieldOfStudy: edu.fieldOfStudy || null,
              location: edu.location || null,
              startDate: edu.startDate ? new Date(edu.startDate) : null,
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              current: edu.current,
              highlights: edu.highlights,
              order: index,
            })),
          }),

        data.projects.length > 0 &&
          tx.project.createMany({
            data: data.projects.map((project, index) => ({
              profileId,
              name: project.name,
              description: project.description || null,
              url: project.url || null,
              startDate: project.startDate ? new Date(project.startDate) : null,
              endDate: project.endDate ? new Date(project.endDate) : null,
              highlights: project.highlights,
              order: index,
            })),
          }),

        data.skills.length > 0 &&
          tx.userSkill.createMany({
            data: data.skills.map((skill, index) => ({
              profileId,
              name: skill.name,
              category: skill.category || null,
              level: skill.level || null,
              order: index,
            })),
          }),

        data.certifications.length > 0 &&
          tx.certification.createMany({
            data: data.certifications.map((cert, index) => ({
              profileId,
              name: cert.name,
              issuer: cert.issuer || null,
              issueDate: cert.issueDate ? new Date(cert.issueDate) : null,
              expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
              credentialId: cert.credentialId || null,
              credentialUrl: cert.credentialUrl || null,
              order: index,
            })),
          }),

        data.languages.length > 0 &&
          tx.language.createMany({
            data: data.languages.map((lang, index) => ({
              profileId,
              name: lang.name,
              proficiency: lang.proficiency || null,
              order: index,
            })),
          }),

        data.achievements.length > 0 &&
          tx.achievement.createMany({
            data: data.achievements.map((achievement, index) => ({
              profileId,
              title: achievement.title,
              issuer: achievement.issuer || null,
              date: achievement.date ? new Date(achievement.date) : null,
              description: achievement.description || null,
              order: index,
            })),
          }),
      ]);

      return updatedProfile;
    });

    return { success: true, profileId: profile.id };
  } catch (error) {
    console.error("Error updating profile:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update profile",
    };
  }
}
