"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { ResumeData } from "@/lib/types/resume";

interface ResumeTemplateProps {
  data: ResumeData;
}

// ATS-Compliant Design Principles:
// 1. Single column layout - no tables or complex structures
// 2. Standard fonts (Helvetica/Arial family)
// 3. Clear section headings with standard naming
// 4. No graphics, images, or icons
// 5. Simple bullet points (• character)
// 6. Consistent formatting throughout
// 7. Contact info as plain text (not in headers/footers)
// 8. Standard date formats
// 9. No text boxes or columns
// 10. Adequate white space and margins

const colors = {
  primary: "#000000",
  secondary: "#333333",
  muted: "#555555",
  border: "#000000",
};

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: colors.primary,
    lineHeight: 1.4,
  },
  // Header Section
  header: {
    marginBottom: 16,
    textAlign: "center",
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginBottom: 10,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  headline: {
    fontSize: 11,
    color: colors.secondary,
    marginBottom: 6,
  },
  contactInfo: {
    fontSize: 9,
    color: colors.secondary,
    marginBottom: 2,
  },
  contactSeparator: {
    marginHorizontal: 6,
  },
  // Section Styles
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    marginBottom: 6,
    paddingBottom: 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  // Summary/Bio
  summary: {
    fontSize: 10,
    color: colors.secondary,
    lineHeight: 1.5,
    textAlign: "justify",
  },
  // Experience Items
  experienceItem: {
    marginBottom: 10,
  },
  experienceHeader: {
    marginBottom: 2,
  },
  experienceTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  experienceTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  experienceDate: {
    fontSize: 9,
    color: colors.muted,
  },
  experienceCompanyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  experienceCompany: {
    fontSize: 10,
    fontFamily: "Helvetica-Oblique",
    color: colors.secondary,
  },
  experienceLocation: {
    fontSize: 9,
    color: colors.muted,
  },
  // Bullet Points
  bulletList: {
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 8,
  },
  bullet: {
    width: 12,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    lineHeight: 1.4,
  },
  // Education
  educationItem: {
    marginBottom: 8,
  },
  educationDegree: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  educationSchool: {
    fontSize: 10,
    fontFamily: "Helvetica-Oblique",
    color: colors.secondary,
  },
  educationDetails: {
    fontSize: 9,
    color: colors.muted,
  },
  // Skills - comma separated for ATS
  skillsText: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  skillCategory: {
    marginBottom: 4,
  },
  skillCategoryName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
  },
  // Projects
  projectItem: {
    marginBottom: 8,
  },
  projectName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
  },
  projectUrl: {
    fontSize: 8,
    color: colors.muted,
  },
  projectDescription: {
    fontSize: 9,
    color: colors.secondary,
    marginTop: 2,
  },
  // Certifications
  certItem: {
    marginBottom: 4,
  },
  certName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
  },
  certDetails: {
    fontSize: 8,
    color: colors.muted,
  },
  // Languages & Other
  inlineList: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  // Links (plain text for ATS)
  linkText: {
    fontSize: 9,
    color: colors.secondary,
  },
});

function formatDate(date: Date | null): string {
  if (!date) return "";
  // Defensive: handle string dates from API/JSON that may bypass type system at runtime
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(d);
}

function formatDateRange(
  startDate: Date | null,
  endDate: Date | null,
  current: boolean
): string {
  const start = formatDate(startDate);
  const end = current ? "Present" : formatDate(endDate);
  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  return `${start} - ${end}`;
}

// Group skills by category for better ATS parsing
function groupSkillsByCategory(
  skills: ResumeData["skills"]
): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  skills.forEach((skill) => {
    const category = skill.category || "Technical Skills";
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(skill.name);
  });
  return grouped;
}

export function ResumeTemplate({ data }: ResumeTemplateProps) {
  const groupedSkills = groupSkillsByCategory(data.skills);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header - Name and Contact Info */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.displayName}</Text>
          {data.headline && (
            <Text style={styles.headline}>{data.headline}</Text>
          )}
          <Text style={styles.contactInfo}>
            {[
              data.email,
              data.phone,
              data.location,
              data.website?.replace(/^https?:\/\//, ""),
            ]
              .filter(Boolean)
              .join(" | ")}
          </Text>
          {data.socialLinks.length > 0 && (
            <Text style={styles.contactInfo}>
              {data.socialLinks
                .map((link) => link.url.replace(/^https?:\/\//, ""))
                .join(" | ")}
            </Text>
          )}
        </View>

        {/* Professional Summary */}
        {data.bio && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{data.bio}</Text>
          </View>
        )}

        {/* Work Experience */}
        {data.workExperiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {data.workExperiences.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View style={styles.experienceTitleRow}>
                    <Text style={styles.experienceTitle}>{exp.position}</Text>
                    <Text style={styles.experienceDate}>
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </Text>
                  </View>
                  <View style={styles.experienceCompanyRow}>
                    <Text style={styles.experienceCompany}>{exp.company}</Text>
                    {exp.location && (
                      <Text style={styles.experienceLocation}>
                        {exp.location}
                      </Text>
                    )}
                  </View>
                </View>
                {exp.bullets.length > 0 && (
                  <View style={styles.bulletList}>
                    {exp.bullets.map((bullet, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {data.educations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.educations.map((edu, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceTitleRow}>
                  <Text style={styles.educationDegree}>
                    {edu.degree}
                    {edu.fieldOfStudy && ` in ${edu.fieldOfStudy}`}
                  </Text>
                  <Text style={styles.experienceDate}>
                    {formatDateRange(edu.startDate, edu.endDate, edu.current)}
                  </Text>
                </View>
                <Text style={styles.educationSchool}>{edu.school}</Text>
                {edu.highlights.length > 0 && (
                  <View style={styles.bulletList}>
                    {edu.highlights.map((highlight, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{highlight}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Skills - Grouped by category, comma-separated for ATS */}
        {data.skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            {Object.entries(groupedSkills).map(([category, skills]) => (
              <View key={category} style={styles.skillCategory}>
                <Text style={styles.skillsText}>
                  <Text style={styles.skillCategoryName}>{category}: </Text>
                  {skills.join(", ")}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((project, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceTitleRow}>
                  <Text style={styles.projectName}>{project.name}</Text>
                  {(project.startDate || project.endDate) && (
                    <Text style={styles.experienceDate}>
                      {formatDateRange(
                        project.startDate,
                        project.endDate,
                        false
                      )}
                    </Text>
                  )}
                </View>
                {project.url && (
                  <Text style={styles.projectUrl}>
                    {project.url.replace(/^https?:\/\//, "")}
                  </Text>
                )}
                {project.description && (
                  <Text style={styles.projectDescription}>
                    {project.description}
                  </Text>
                )}
                {project.highlights.length > 0 && (
                  <View style={styles.bulletList}>
                    {project.highlights.map((highlight, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{highlight}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Certifications */}
        {data.certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {data.certifications.map((cert, index) => (
              <View key={index} style={styles.certItem}>
                <Text style={styles.certName}>
                  {cert.name}
                  {cert.issuer && ` - ${cert.issuer}`}
                </Text>
                {(cert.issueDate || cert.credentialId) && (
                  <Text style={styles.certDetails}>
                    {[
                      cert.issueDate && `Issued: ${formatDate(cert.issueDate)}`,
                      cert.expiryDate &&
                        `Expires: ${formatDate(cert.expiryDate)}`,
                      cert.credentialId && `ID: ${cert.credentialId}`,
                    ]
                      .filter(Boolean)
                      .join(" | ")}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Languages */}
        {data.languages.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Languages</Text>
            <Text style={styles.inlineList}>
              {data.languages
                .map(
                  (lang) =>
                    `${lang.name}${lang.proficiency ? ` (${lang.proficiency})` : ""}`
                )
                .join(", ")}
            </Text>
          </View>
        )}

        {/* Achievements */}
        {data.achievements.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Awards & Achievements</Text>
            {data.achievements.map((achievement, index) => (
              <View key={index} style={styles.experienceItem}>
                <Text style={styles.certName}>
                  {achievement.title}
                  {achievement.issuer && ` - ${achievement.issuer}`}
                  {achievement.date && ` (${formatDate(achievement.date)})`}
                </Text>
                {achievement.description && (
                  <Text style={styles.certDetails}>
                    {achievement.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Volunteer Experience */}
        {data.volunteerExperiences.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Volunteer Experience</Text>
            {data.volunteerExperiences.map((exp, index) => (
              <View key={index} style={styles.experienceItem}>
                <View style={styles.experienceHeader}>
                  <View style={styles.experienceTitleRow}>
                    <Text style={styles.experienceTitle}>{exp.role}</Text>
                    <Text style={styles.experienceDate}>
                      {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                    </Text>
                  </View>
                  <Text style={styles.experienceCompany}>
                    {exp.organization}
                  </Text>
                </View>
                {exp.bullets.length > 0 && (
                  <View style={styles.bulletList}>
                    {exp.bullets.map((bullet, i) => (
                      <View key={i} style={styles.bulletItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.bulletText}>{bullet}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}
