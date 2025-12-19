import { z } from "zod";

/**
 * Domain Model for Resume Data
 * This is the single source of truth for all Resume Templates.
 * It is decoupled from the Database (Prisma) and the Form (TanStack).
 */

export const ResumeDataSchema = z.object({
  // Basic Info
  displayName: z.string(),
  headline: z.string().nullable(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  location: z.string().nullable(),
  bio: z.string().nullable(),

  // Personal Details
  dateOfBirth: z.date().nullable(),
  gender: z.string().nullable(),
  nationality: z.string().nullable(),
  maritalStatus: z.string().nullable(),
  visaStatus: z.string().nullable(),

  // Lists
  hobbies: z.array(z.string()),

  socialLinks: z.array(
    z.object({
      platform: z.string(),
      url: z.string(),
      label: z.string().nullable(),
    })
  ),

  workExperiences: z.array(
    z.object({
      company: z.string(),
      position: z.string(),
      location: z.string().nullable(),
      startDate: z.date().nullable(),
      endDate: z.date().nullable(),
      current: z.boolean(),
      bullets: z.array(z.string()),
    })
  ),

  volunteerExperiences: z.array(
    z.object({
      organization: z.string(),
      role: z.string(),
      location: z.string().nullable(),
      startDate: z.date().nullable(),
      endDate: z.date().nullable(),
      current: z.boolean(),
      bullets: z.array(z.string()),
    })
  ),

  educations: z.array(
    z.object({
      school: z.string(),
      degree: z.string(),
      fieldOfStudy: z.string().nullable(),
      location: z.string().nullable(),
      startDate: z.date().nullable(),
      endDate: z.date().nullable(),
      current: z.boolean(),
      highlights: z.array(z.string()),
    })
  ),

  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string().nullable(),
      url: z.string().nullable(),
      startDate: z.date().nullable(),
      endDate: z.date().nullable(),
      highlights: z.array(z.string()),
    })
  ),

  skills: z.array(
    z.object({
      name: z.string(),
      category: z.string().nullable(),
      level: z.string().nullable(),
    })
  ),

  certifications: z.array(
    z.object({
      name: z.string(),
      issuer: z.string().nullable(),
      issueDate: z.date().nullable(),
      expiryDate: z.date().nullable(),
      credentialId: z.string().nullable(),
      credentialUrl: z.string().nullable(),
    })
  ),

  languages: z.array(
    z.object({
      name: z.string(),
      proficiency: z.string().nullable(),
    })
  ),

  achievements: z.array(
    z.object({
      title: z.string(),
      issuer: z.string().nullable(),
      date: z.date().nullable(),
      description: z.string().nullable(),
    })
  ),
});

export type ResumeData = z.infer<typeof ResumeDataSchema>;
