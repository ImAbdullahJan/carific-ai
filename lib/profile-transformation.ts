import type { getFullProfile } from "@/lib/db/profile";
import type { ProfileFormValues } from "@/lib/validations/profile-update";

type FullProfile = NonNullable<Awaited<ReturnType<typeof getFullProfile>>>;

// Helper to format date for form input
export function formatDateForInput(date: Date | null): string {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
}

// Transform profile data to form values
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

// Helper to safely merge form values (strings) into profile (Dates) for preview
export function mergeFormValuesWithProfile(
  originalProfile: FullProfile,
  formValues: ProfileFormValues
): FullProfile {
  return {
    ...originalProfile,
    ...formValues,
    workExperiences: formValues.workExperiences.map((exp) => ({
      ...exp,
      startDate: exp.startDate ? new Date(exp.startDate) : null,
      endDate: exp.endDate ? new Date(exp.endDate) : null,
      profileId: originalProfile.id,
      order: 0, // Placeholder as it's just for preview
    })),
    educations: formValues.educations.map((edu) => ({
      ...edu,
      startDate: edu.startDate ? new Date(edu.startDate) : null,
      endDate: edu.endDate ? new Date(edu.endDate) : null,
      profileId: originalProfile.id,
      order: 0,
    })),
    projects: formValues.projects.map((proj) => ({
      ...proj,
      startDate: proj.startDate ? new Date(proj.startDate) : null,
      endDate: proj.endDate ? new Date(proj.endDate) : null,
      profileId: originalProfile.id,
      order: 0,
    })),
    certifications: formValues.certifications.map((cert) => ({
      ...cert,
      issueDate: cert.issueDate ? new Date(cert.issueDate) : null,
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
      profileId: originalProfile.id,
      order: 0,
    })),
    achievements: formValues.achievements.map((ach) => ({
      ...ach,
      date: ach.date ? new Date(ach.date) : null,
      profileId: originalProfile.id,
      order: 0,
    })),
    volunteerExperiences: formValues.volunteerExperiences.map((vol) => ({
      ...vol,
      startDate: vol.startDate ? new Date(vol.startDate) : null,
      endDate: vol.endDate ? new Date(vol.endDate) : null,
      profileId: originalProfile.id,
      order: 0,
    })),
    skills: formValues.skills.map((s) => ({
      ...s,
      profileId: originalProfile.id,
      order: 0,
    })),
    languages: formValues.languages.map((l) => ({
      ...l,
      profileId: originalProfile.id,
      order: 0,
    })),
    socialLinks: formValues.socialLinks.map((s) => ({
      ...s,
      profileId: originalProfile.id,
      order: 0,
    })),
  } as unknown as FullProfile;
}
