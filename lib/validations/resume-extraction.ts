import { z } from "zod";

// ============================================================
// RESUME EXTRACTION SCHEMA
// Used for AI-structured data extraction from text resumes
// Maps to Prisma models for UserProfile and related entities
// ============================================================

// --- Social Link ---
export const SocialLinkExtractionSchema = z.object({
  platform: z
    .string()
    .describe(
      'Platform identifier in lowercase: "linkedin", "github", "twitter", "dribbble", "behance", "medium", "stackoverflow", or "custom"'
    ),
  url: z
    .string()
    .describe(
      "COMPLETE clickable URL starting with https:// (e.g., https://linkedin.com/in/johndoe). If only username is provided, construct the full URL based on the platform."
    ),
  label: z
    .string()
    .nullable()
    .describe("Display label if different from platform name"),
});

// --- Work Experience ---
export const WorkExperienceExtractionSchema = z.object({
  company: z.string().describe("Company or organization name"),
  position: z.string().describe("Job title or role"),
  location: z
    .string()
    .nullable()
    .describe('Location (city, state/country) or "Remote"'),
  startDate: z
    .string()
    .describe("Start date in ISO format (YYYY-MM-DD) or partial (YYYY-MM)"),
  endDate: z
    .string()
    .nullable()
    .describe("End date in ISO format, or null/undefined if current position"),
  current: z.boolean().describe("True if this is the current/present position"),
  bullets: z
    .array(z.string())
    .describe(
      "List of achievements/responsibilities as individual bullet points"
    ),
});

// --- Volunteer Experience ---
export const VolunteerExperienceExtractionSchema = z.object({
  organization: z.string().describe("Organization or charity name"),
  role: z.string().describe("Volunteer role or title"),
  location: z.string().nullable().describe("Location if mentioned"),
  startDate: z
    .string()
    .nullable()
    .describe("Start date in ISO format if available"),
  endDate: z
    .string()
    .nullable()
    .describe("End date in ISO format, or null if ongoing"),
  current: z.boolean().describe("True if currently volunteering here"),
  bullets: z
    .array(z.string())
    .describe("List of contributions/achievements as bullet points"),
});

// --- Education ---
export const EducationExtractionSchema = z.object({
  school: z.string().describe("School, university, or institution name"),
  degree: z
    .string()
    .describe('Degree type (e.g., "Bachelor of Science", "MBA", "PhD")'),
  fieldOfStudy: z
    .string()
    .nullable()
    .describe('Major or field (e.g., "Computer Science")'),
  location: z.string().nullable().describe("Location of the institution"),
  startDate: z.string().nullable().describe("Start date in ISO format"),
  endDate: z.string().nullable().describe("End/graduation date in ISO format"),
  current: z.boolean().describe("True if currently studying here"),
  highlights: z
    .array(z.string())
    .describe("GPA, honors, activities, relevant coursework as bullet points"),
});

// --- Project ---
export const ProjectExtractionSchema = z.object({
  name: z.string().describe("Project name or title"),
  description: z.string().nullable().describe("Brief project description"),
  url: z.string().nullable().describe("Project URL, GitHub link, or demo link"),
  startDate: z.string().nullable().describe("Start date if mentioned"),
  endDate: z.string().nullable().describe("End date if mentioned"),
  highlights: z
    .array(z.string())
    .describe("Key achievements, technologies used, or outcomes"),
});

// --- Skill ---
export const SkillExtractionSchema = z.object({
  name: z.string().describe("Skill name"),
  category: z
    .string()
    .nullable()
    .describe(
      'Category: "Hard" or "Soft", or specific like "Languages", "Frameworks", "Tools", "Databases"'
    ),
  level: z
    .string()
    .nullable()
    .describe(
      'Proficiency level if mentioned: "Beginner", "Intermediate", "Advanced", "Expert"'
    ),
});

// --- Certification ---
export const CertificationExtractionSchema = z.object({
  name: z.string().describe("Certification name"),
  issuer: z
    .string()
    .nullable()
    .describe('Issuing organization (e.g., "AWS", "Google", "Coursera")'),
  issueDate: z.string().nullable().describe("Issue date in ISO format"),
  expiryDate: z
    .string()
    .nullable()
    .describe("Expiry date in ISO format, if applicable"),
  credentialId: z
    .string()
    .nullable()
    .describe("Certificate ID or credential number"),
  credentialUrl: z.string().nullable().describe("Verification URL if provided"),
});

// --- Language ---
export const LanguageExtractionSchema = z.object({
  name: z.string().describe('Language name (e.g., "English", "Spanish")'),
  proficiency: z
    .string()
    .nullable()
    .describe(
      'Proficiency level: "Native", "Fluent", "Professional", "Conversational", "Basic"'
    ),
});

// --- Achievement ---
export const AchievementExtractionSchema = z.object({
  title: z
    .string()
    .describe(
      'Achievement or award title (e.g., "Employee of the Year", "Dean\'s List")'
    ),
  issuer: z
    .string()
    .nullable()
    .describe("Organization that granted the achievement"),
  date: z.string().nullable().describe("Date received in ISO format"),
  description: z
    .string()
    .nullable()
    .describe("Brief description of the achievement"),
});

// ============================================================
// MAIN EXTRACTION SCHEMA
// This is the complete schema for extracting all resume data
// ============================================================

export const ResumeExtractionSchema = z.object({
  // Contact & Personal Info
  displayName: z.string().describe("Full name as it appears on the resume"),
  headline: z
    .string()
    .nullable()
    .describe(
      'Professional headline or title (e.g., "Senior Software Engineer")'
    ),
  email: z.string().nullable().describe("Contact email address"),
  phone: z.string().nullable().describe("Phone number in any format"),
  website: z.string().nullable().describe("Personal website URL"),
  location: z.string().nullable().describe("Location (city, state/country)"),
  bio: z
    .string()
    .nullable()
    .describe("Professional summary or objective statement"),

  // Optional Personal Details (region-specific)
  dateOfBirth: z
    .string()
    .nullable()
    .describe("Date of birth in ISO format if present"),
  gender: z.string().nullable().describe("Gender if mentioned"),
  nationality: z.string().nullable().describe("Nationality if mentioned"),
  maritalStatus: z.string().nullable().describe("Marital status if mentioned"),
  visaStatus: z
    .string()
    .nullable()
    .describe("Visa or work authorization status if mentioned"),
  privacyConsent: z
    .boolean()
    .default(false)
    .describe("Whether the user has given privacy consent for sensitive data"),

  // Interests
  hobbies: z
    .array(z.string())
    .nullable()
    .describe("List of hobbies or interests"),

  // Social Links
  socialLinks: z
    .array(SocialLinkExtractionSchema)
    .nullable()
    .describe("Social media and professional profile links"),

  // Experience Sections
  workExperiences: z
    .array(WorkExperienceExtractionSchema)
    .describe("Work experience entries, ordered from most recent to oldest"),

  volunteerExperiences: z
    .array(VolunteerExperienceExtractionSchema)
    .nullable()
    .describe("Volunteer experience entries"),

  // Education
  educations: z
    .array(EducationExtractionSchema)
    .describe("Education entries, ordered from most recent to oldest"),

  // Projects
  projects: z
    .array(ProjectExtractionSchema)
    .nullable()
    .describe("Personal or professional projects"),

  // Skills
  skills: z.array(SkillExtractionSchema).describe("Technical and soft skills"),

  // Certifications
  certifications: z
    .array(CertificationExtractionSchema)
    .nullable()
    .describe("Professional certifications and licenses"),

  // Languages
  languages: z
    .array(LanguageExtractionSchema)
    .nullable()
    .describe("Languages spoken"),

  // Achievements
  achievements: z
    .array(AchievementExtractionSchema)
    .nullable()
    .describe("Awards, honors, and achievements"),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type ResumeExtraction = z.infer<typeof ResumeExtractionSchema>;
export type SocialLinkExtraction = z.infer<typeof SocialLinkExtractionSchema>;
export type WorkExperienceExtraction = z.infer<
  typeof WorkExperienceExtractionSchema
>;
export type VolunteerExperienceExtraction = z.infer<
  typeof VolunteerExperienceExtractionSchema
>;
export type EducationExtraction = z.infer<typeof EducationExtractionSchema>;
export type ProjectExtraction = z.infer<typeof ProjectExtractionSchema>;
export type SkillExtraction = z.infer<typeof SkillExtractionSchema>;
export type CertificationExtraction = z.infer<
  typeof CertificationExtractionSchema
>;
export type LanguageExtraction = z.infer<typeof LanguageExtractionSchema>;
export type AchievementExtraction = z.infer<typeof AchievementExtractionSchema>;
