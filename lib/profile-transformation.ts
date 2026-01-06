import type { getFullProfile } from "@/lib/db/profile";
import type { ProfileFormValues } from "@/lib/validations/profile-update";
import type { ResumeData } from "@/lib/types/resume";

type FullProfile = NonNullable<Awaited<ReturnType<typeof getFullProfile>>>;

/**
 * Helper to format date for form input
 */
export function formatDateForInput(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

/**
 * Transforms Database Profile to Resume Domain Data
 */
export function profileToResume(profile: FullProfile): ResumeData {
  return {
    displayName: profile.displayName || "",
    headline: profile.headline,
    email: profile.email,
    phone: profile.phone,
    website: profile.website,
    location: profile.location,
    bio: profile.bio,
    dateOfBirth: profile.dateOfBirth,
    gender: profile.gender,
    nationality: profile.nationality,
    maritalStatus: profile.maritalStatus,
    visaStatus: profile.visaStatus,
    hobbies: profile.hobbies,
    privacyConsent: profile.privacyConsent,
    socialLinks: profile.socialLinks.map((link) => ({
      platform: link.platform,
      url: link.url,
      label: link.label || null,
    })),
    workExperiences: profile.workExperiences.map((exp) => ({
      id: exp.id,
      company: exp.company,
      position: exp.position,
      location: exp.location || null,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      bullets: exp.bullets,
    })),
    volunteerExperiences: profile.volunteerExperiences.map((exp) => ({
      id: exp.id,
      organization: exp.organization,
      role: exp.role,
      location: exp.location || null,
      startDate: exp.startDate,
      endDate: exp.endDate,
      current: exp.current,
      bullets: exp.bullets,
    })),
    educations: profile.educations.map((edu) => ({
      id: edu.id,
      school: edu.school,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy || null,
      location: edu.location || null,
      startDate: edu.startDate,
      endDate: edu.endDate,
      current: edu.current,
      highlights: edu.highlights,
    })),
    projects: profile.projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description || null,
      url: project.url || null,
      startDate: project.startDate,
      endDate: project.endDate,
      highlights: project.highlights,
    })),
    skills: profile.skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      category: skill.category || null,
      level: skill.level || null,
    })),
    certifications: profile.certifications.map((cert) => ({
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer || null,
      issueDate: cert.issueDate,
      expiryDate: cert.expiryDate,
      credentialId: cert.credentialId || null,
      credentialUrl: cert.credentialUrl || null,
    })),
    languages: profile.languages.map((lang) => ({
      id: lang.id,
      name: lang.name,
      proficiency: lang.proficiency || null,
    })),
    achievements: profile.achievements.map((achievement) => ({
      id: achievement.id,
      title: achievement.title,
      issuer: achievement.issuer || null,
      date: achievement.date,
      description: achievement.description || null,
    })),
  };
}

/**
 * Transforms Form Values to Resume Domain Data
 */
export function formToResume(formValues: ProfileFormValues): ResumeData {
  return {
    displayName: formValues.displayName,
    headline: formValues.headline || null,
    email: formValues.email || null,
    phone: formValues.phone || null,
    website: formValues.website || null,
    location: formValues.location || null,
    bio: formValues.bio || null,
    dateOfBirth: formValues.dateOfBirth
      ? new Date(formValues.dateOfBirth)
      : null,
    gender: formValues.gender || null,
    nationality: formValues.nationality || null,
    maritalStatus: formValues.maritalStatus || null,
    visaStatus: formValues.visaStatus || null,
    hobbies: formValues.hobbies,
    privacyConsent: formValues.privacyConsent,
    socialLinks: formValues.socialLinks.map((link) => ({
      platform: link.platform,
      url: link.url,
      label: link.label || null,
    })),
    workExperiences: formValues.workExperiences.map((exp) => ({
      company: exp.company,
      position: exp.position,
      location: exp.location || null,
      startDate: exp.startDate ? new Date(exp.startDate) : null,
      endDate: exp.endDate ? new Date(exp.endDate) : null,
      current: exp.current,
      bullets: exp.bullets,
    })),
    volunteerExperiences: formValues.volunteerExperiences.map((vol) => ({
      organization: vol.organization,
      role: vol.role,
      location: vol.location || null,
      startDate: vol.startDate ? new Date(vol.startDate) : null,
      endDate: vol.endDate ? new Date(vol.endDate) : null,
      current: vol.current,
      bullets: vol.bullets,
    })),
    educations: formValues.educations.map((edu) => ({
      school: edu.school,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy || null,
      location: edu.location || null,
      startDate: edu.startDate ? new Date(edu.startDate) : null,
      endDate: edu.endDate ? new Date(edu.endDate) : null,
      current: edu.current,
      highlights: edu.highlights,
    })),
    projects: formValues.projects.map((proj) => ({
      name: proj.name,
      description: proj.description || null,
      url: proj.url || null,
      startDate: proj.startDate ? new Date(proj.startDate) : null,
      endDate: proj.endDate ? new Date(proj.endDate) : null,
      highlights: proj.highlights,
    })),
    skills: formValues.skills.map((s) => ({
      name: s.name,
      category: s.category || null,
      level: s.level || null,
    })),
    certifications: formValues.certifications.map((cert) => ({
      name: cert.name,
      issuer: cert.issuer || null,
      issueDate: cert.issueDate ? new Date(cert.issueDate) : null,
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
      credentialId: cert.credentialId || null,
      credentialUrl: cert.credentialUrl || null,
    })),
    languages: formValues.languages.map((l) => ({
      name: l.name,
      proficiency: l.proficiency || null,
    })),
    achievements: formValues.achievements.map((ach) => ({
      title: ach.title,
      issuer: ach.issuer || null,
      date: ach.date ? new Date(ach.date) : null,
      description: ach.description || null,
    })),
  };
}

/**
 * Transforms Database Profile to Form Values
 */
export function profileToFormValues(profile: FullProfile): ProfileFormValues {
  return {
    displayName: profile.displayName || "",
    headline: profile.headline || "",
    email: profile.email || "",
    phone: profile.phone || "",
    website: profile.website || "",
    location: profile.location || "",
    bio: profile.bio || "",
    dateOfBirth: formatDateForInput(profile.dateOfBirth),
    gender: profile.gender || "",
    nationality: profile.nationality || "",
    maritalStatus: profile.maritalStatus || "",
    visaStatus: profile.visaStatus || "",
    hobbies: profile.hobbies || [],
    privacyConsent: profile.privacyConsent,
    socialLinks: profile.socialLinks.map((link) => ({
      id: link.id,
      platform: link.platform,
      url: link.url,
      label: link.label || "",
    })),
    workExperiences: profile.workExperiences.map((exp) => ({
      id: exp.id,
      company: exp.company,
      position: exp.position,
      location: exp.location || "",
      startDate: formatDateForInput(exp.startDate),
      endDate: formatDateForInput(exp.endDate),
      current: exp.current,
      bullets: exp.bullets,
    })),
    volunteerExperiences: profile.volunteerExperiences.map((exp) => ({
      id: exp.id,
      organization: exp.organization,
      role: exp.role,
      location: exp.location || "",
      startDate: formatDateForInput(exp.startDate),
      endDate: formatDateForInput(exp.endDate),
      current: exp.current,
      bullets: exp.bullets,
    })),
    educations: profile.educations.map((edu) => ({
      id: edu.id,
      school: edu.school,
      degree: edu.degree,
      fieldOfStudy: edu.fieldOfStudy || "",
      location: edu.location || "",
      startDate: formatDateForInput(edu.startDate),
      endDate: formatDateForInput(edu.endDate),
      current: edu.current,
      highlights: edu.highlights,
    })),
    projects: profile.projects.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description || "",
      url: project.url || "",
      startDate: formatDateForInput(project.startDate),
      endDate: formatDateForInput(project.endDate),
      highlights: project.highlights,
    })),
    skills: profile.skills.map((skill) => ({
      id: skill.id,
      name: skill.name,
      category: skill.category || "",
      level: skill.level || "",
    })),
    certifications: profile.certifications.map((cert) => ({
      id: cert.id,
      name: cert.name,
      issuer: cert.issuer || "",
      issueDate: formatDateForInput(cert.issueDate),
      expiryDate: formatDateForInput(cert.expiryDate),
      credentialId: cert.credentialId || "",
      credentialUrl: cert.credentialUrl || "",
    })),
    languages: profile.languages.map((lang) => ({
      id: lang.id,
      name: lang.name,
      proficiency: lang.proficiency || "",
    })),
    achievements: profile.achievements.map((achievement) => ({
      id: achievement.id,
      title: achievement.title,
      issuer: achievement.issuer || "",
      date: formatDateForInput(achievement.date),
      description: achievement.description || "",
    })),
  };
}
