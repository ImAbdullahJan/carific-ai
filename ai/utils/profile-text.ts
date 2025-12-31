import type { getFullProfile } from "@/lib/db/profile";

type FullProfile = NonNullable<Awaited<ReturnType<typeof getFullProfile>>>;

function formatDate(date: Date | null): string {
  if (!date) return "N/A";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function formatProfileForAnalysis(profile: FullProfile) {
  const sections: string[] = [];

  sections.push(`## Contact Information
Name: ${profile.displayName || "Not provided"}
Email: ${profile.email || "Not provided"}
Phone: ${profile.phone || "Not provided"}
Location: ${profile.location || "Not provided"}
Website: ${profile.website || "Not provided"}`);

  const headline = profile.headline?.trim();
  const bio = profile.bio?.trim();
  if (headline || bio) {
    sections.push(`## Summary
${headline || ""}
${bio || ""}`);
  }

  if (profile.workExperiences.length > 0) {
    const expText = profile.workExperiences
      .map((exp) => {
        const dateRange = exp.current
          ? `${formatDate(exp.startDate)} - Present`
          : `${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}`;
        const parts = [
          `${exp.position} at ${exp.company} (${dateRange})`,
          exp.location ? `Location: ${exp.location}` : null,
          ...exp.bullets.map((b) => `  • ${b}`),
        ].filter((p) => p !== null && p !== "");
        return parts.join("\n");
      })
      .join("\n\n");
    sections.push(`## Work Experience\n${expText}`);
  }

  if (profile.educations.length > 0) {
    const eduText = profile.educations
      .map((edu) => {
        const dateRange = edu.current
          ? `${formatDate(edu.startDate)} - Present`
          : `${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}`;
        return `${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ""} - ${edu.school} (${dateRange})`;
      })
      .join("\n");
    sections.push(`## Education\n${eduText}`);
  }

  if (profile.skills.length > 0) {
    const skillsByCategory = profile.skills.reduce(
      (acc, skill) => {
        const cat = skill.category || "Other";
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(skill.name);
        return acc;
      },
      {} as Record<string, string[]>
    );

    const skillsText = Object.entries(skillsByCategory)
      .map(([cat, skills]) => `${cat}: ${skills.join(", ")}`)
      .join("\n");
    sections.push(`## Skills\n${skillsText}`);
  }

  if (profile.certifications.length > 0) {
    const certText = profile.certifications
      .map((cert) => `${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ""}`)
      .join("\n");
    sections.push(`## Certifications\n${certText}`);
  }

  if (profile.projects.length > 0) {
    const projText = profile.projects
      .map((proj) => {
        const parts = [
          `${proj.name}${proj.description ? `: ${proj.description}` : ""}`,
          ...proj.highlights.map((h) => `  • ${h}`),
        ].filter((p) => p !== "");
        return parts.join("\n");
      })
      .join("\n\n");
    sections.push(`## Projects\n${projText}`);
  }

  return sections.join("\n\n");
}
