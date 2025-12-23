import { z } from "zod";

// ============================================================
// PROFILE UPDATE VALIDATION SCHEMA
// Used for validating user input when editing their profile
// ============================================================

// --- Social Link ---
export const SocialLinkSchema = z.object({
  id: z.string().optional(),
  platform: z.string().min(1, "Platform is required"),
  url: z.url("Must be a valid URL"),
  label: z.string().optional(),
});

// --- Work Experience ---
export const WorkExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, "Company name is required"),
  position: z.string().min(1, "Position is required"),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

// --- Volunteer Experience ---
export const VolunteerExperienceSchema = z.object({
  id: z.string().optional(),
  organization: z.string().min(1, "Organization name is required"),
  role: z.string().min(1, "Role is required"),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

// --- Education ---
export const EducationSchema = z.object({
  id: z.string().optional(),
  school: z.string().min(1, "School name is required"),
  degree: z.string().min(1, "Degree is required"),
  fieldOfStudy: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  highlights: z.array(z.string()).default([]),
});

// --- Project ---
export const ProjectSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  url: z.url("Must be a valid URL").optional().or(z.literal("")),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});

// --- Skill ---
export const SkillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Skill name is required"),
  category: z.string().optional(),
  level: z.string().optional(),
});

// --- Certification ---
export const CertificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Certification name is required"),
  issuer: z.string().optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.url("Must be a valid URL").optional().or(z.literal("")),
});

// --- Language ---
export const LanguageSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Language name is required"),
  proficiency: z.string().optional(),
});

// --- Achievement ---
export const AchievementSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Achievement title is required"),
  issuer: z.string().optional(),
  date: z.string().optional(),
  description: z.string().optional(),
});

// ============================================================
// MAIN PROFILE UPDATE SCHEMA
// ============================================================

export const ProfileUpdateSchema = z.object({
  // Basic Info
  displayName: z.string().min(1, "Name is required"),
  headline: z.string().optional(),
  email: z.email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.url("Must be a valid URL").optional().or(z.literal("")),
  location: z.string().optional(),
  bio: z.string().optional(),

  // Optional Personal Details
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  nationality: z.string().optional(),
  maritalStatus: z.string().optional(),
  visaStatus: z.string().optional(),
  privacyConsent: z.boolean().default(false),

  // Interests
  hobbies: z.array(z.string()).default([]),

  // Related entities
  socialLinks: z.array(SocialLinkSchema).default([]),
  workExperiences: z.array(WorkExperienceSchema).default([]),
  volunteerExperiences: z.array(VolunteerExperienceSchema).default([]),
  educations: z.array(EducationSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  skills: z.array(SkillSchema).default([]),
  certifications: z.array(CertificationSchema).default([]),
  languages: z.array(LanguageSchema).default([]),
  achievements: z.array(AchievementSchema).default([]),
});

// ============================================================
// TYPE EXPORTS
// ============================================================

export type ProfileUpdate = z.infer<typeof ProfileUpdateSchema>;
export type SocialLinkInput = z.infer<typeof SocialLinkSchema>;
export type WorkExperienceInput = z.infer<typeof WorkExperienceSchema>;
export type VolunteerExperienceInput = z.infer<
  typeof VolunteerExperienceSchema
>;
export type EducationInput = z.infer<typeof EducationSchema>;
export type ProjectInput = z.infer<typeof ProjectSchema>;
export type SkillInput = z.infer<typeof SkillSchema>;
export type CertificationInput = z.infer<typeof CertificationSchema>;
export type LanguageInput = z.infer<typeof LanguageSchema>;
export type AchievementInput = z.infer<typeof AchievementSchema>;

// Form values type - all fields required as strings (matches actual form state)
// This is used by the form components where defaultValues always provide strings
export type ProfileFormValues = {
  displayName: string;
  headline: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  bio: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  maritalStatus: string;
  visaStatus: string;
  privacyConsent: boolean;
  hobbies: string[];
  socialLinks: Required<SocialLinkInput>[];
  workExperiences: Required<WorkExperienceInput>[];
  volunteerExperiences: Required<VolunteerExperienceInput>[];
  educations: Required<EducationInput>[];
  projects: Required<ProjectInput>[];
  skills: Required<SkillInput>[];
  certifications: Required<CertificationInput>[];
  languages: Required<LanguageInput>[];
  achievements: Required<AchievementInput>[];
};

// ============================================================
// FACTORY FUNCTIONS FOR NEW FORM ITEMS
// Return Required<...> types to match ProfileFormValues
// ============================================================

export const createEmptySocialLink = (): Required<SocialLinkInput> => ({
  id: crypto.randomUUID(),
  platform: "",
  url: "",
  label: "",
});

export const createEmptyWorkExperience = (): Required<WorkExperienceInput> => ({
  id: crypto.randomUUID(),
  company: "",
  position: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  bullets: [],
});

export const createEmptyVolunteerExperience =
  (): Required<VolunteerExperienceInput> => ({
    id: crypto.randomUUID(),
    organization: "",
    role: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    bullets: [],
  });

export const createEmptyEducation = (): Required<EducationInput> => ({
  id: crypto.randomUUID(),
  school: "",
  degree: "",
  fieldOfStudy: "",
  location: "",
  startDate: "",
  endDate: "",
  current: false,
  highlights: [],
});

export const createEmptyProject = (): Required<ProjectInput> => ({
  id: crypto.randomUUID(),
  name: "",
  description: "",
  url: "",
  startDate: "",
  endDate: "",
  highlights: [],
});

export const createEmptySkill = (): Required<SkillInput> => ({
  id: crypto.randomUUID(),
  name: "",
  category: "",
  level: "",
});

export const createEmptyCertification = (): Required<CertificationInput> => ({
  id: crypto.randomUUID(),
  name: "",
  issuer: "",
  issueDate: "",
  expiryDate: "",
  credentialId: "",
  credentialUrl: "",
});

export const createEmptyLanguage = (): Required<LanguageInput> => ({
  id: crypto.randomUUID(),
  name: "",
  proficiency: "",
});

export const createEmptyAchievement = (): Required<AchievementInput> => ({
  id: crypto.randomUUID(),
  title: "",
  issuer: "",
  date: "",
  description: "",
});

export const DEFAULT_PROFILE_FORM_VALUES: ProfileFormValues = {
  displayName: "",
  headline: "",
  email: "",
  phone: "",
  website: "",
  location: "",
  bio: "",
  dateOfBirth: "",
  gender: "",
  nationality: "",
  maritalStatus: "",
  visaStatus: "",
  privacyConsent: false,
  hobbies: [],
  socialLinks: [],
  workExperiences: [],
  volunteerExperiences: [],
  educations: [],
  projects: [],
  skills: [],
  certifications: [],
  languages: [],
  achievements: [],
};
