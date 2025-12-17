"use client";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Languages,
  Heart,
  Calendar,
  ExternalLink,
  Linkedin,
  Github,
  Twitter,
  FolderGit2,
  Trophy,
  HandHeart,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { getFullProfile } from "@/lib/db/profile";

type FullProfile = NonNullable<Awaited<ReturnType<typeof getFullProfile>>>;

interface ProfileDetailsProps {
  profile: FullProfile;
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getSocialIcon(platform: string) {
  const p = platform.toLowerCase();
  if (p.includes("linkedin")) return Linkedin;
  if (p.includes("github")) return Github;
  if (p.includes("twitter") || p.includes("x")) return Twitter;
  return Globe;
}

export function ProfileDetails({ profile }: ProfileDetailsProps) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background h-24" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col sm:flex-row gap-6 -mt-12">
            <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
              <AvatarFallback className="text-2xl font-semibold bg-primary text-primary-foreground">
                {getInitials(profile.displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pt-2 sm:pt-8">
              <h1 className="text-2xl font-bold">{profile.displayName}</h1>
              {profile.headline && (
                <p className="text-lg text-muted-foreground mt-1">
                  {profile.headline}
                </p>
              )}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-muted-foreground">
                {profile.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {profile.email}
                  </span>
                )}
                {profile.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {profile.phone}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {profile.location}
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Social Links */}
          {profile.socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {profile.socialLinks.map((link) => {
                const Icon = getSocialIcon(link.platform);
                return (
                  <Button
                    key={link.id}
                    variant="outline"
                    size="sm"
                    asChild
                    className="gap-2"
                  >
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Icon className="h-4 w-4" />
                      {link.label || link.platform}
                    </a>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-muted-foreground leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Work Experience */}
          {profile.workExperiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile.workExperiences.map((exp, index) => (
                  <div key={exp.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{exp.position}</h3>
                        <p className="text-muted-foreground">{exp.company}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDate(exp.startDate)} -{" "}
                            {exp.current ? "Present" : formatDate(exp.endDate)}
                          </span>
                          {exp.location && (
                            <>
                              <span>•</span>
                              <MapPin className="h-3 w-3" />
                              <span>{exp.location}</span>
                            </>
                          )}
                        </div>
                      </div>
                      {exp.current && <Badge>Current</Badge>}
                    </div>
                    {exp.bullets.length > 0 && (
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {exp.bullets.map((bullet, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-primary mt-1.5">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {index < profile.workExperiences.length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Volunteer Experience */}
          {profile.volunteerExperiences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HandHeart className="h-5 w-5 text-primary" />
                  Volunteer Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile.volunteerExperiences.map((exp, index) => (
                  <div key={exp.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{exp.role}</h3>
                        <p className="text-muted-foreground">
                          {exp.organization}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDate(exp.startDate)} -{" "}
                            {exp.current ? "Present" : formatDate(exp.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {exp.bullets.length > 0 && (
                      <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                        {exp.bullets.map((bullet, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-primary mt-1.5">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {index < profile.volunteerExperiences.length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Education */}
          {profile.educations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile.educations.map((edu, index) => (
                  <div key={edu.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold">{edu.degree}</h3>
                        <p className="text-muted-foreground">{edu.school}</p>
                        {edu.fieldOfStudy && (
                          <p className="text-sm text-muted-foreground">
                            {edu.fieldOfStudy}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {formatDate(edu.startDate)} -{" "}
                            {edu.current ? "Present" : formatDate(edu.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    {edu.highlights.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                        {edu.highlights.map((highlight, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {index < profile.educations.length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Projects */}
          {profile.projects.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderGit2 className="h-5 w-5 text-primary" />
                  Projects
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {profile.projects.map((project, index) => (
                  <div key={project.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{project.name}</h3>
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                        {project.description && (
                          <p className="text-muted-foreground mt-1">
                            {project.description}
                          </p>
                        )}
                        {(project.startDate || project.endDate) && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {formatDate(project.startDate)}
                              {project.endDate &&
                                ` - ${formatDate(project.endDate)}`}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {project.highlights.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                        {project.highlights.map((highlight, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {index < profile.projects.length - 1 && (
                      <Separator className="mt-6" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          {profile.skills.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Code className="h-5 w-5 text-primary" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.name}
                      {skill.level && (
                        <span className="ml-1 text-xs opacity-70">
                          • {skill.level}
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Certifications */}
          {profile.certifications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-5 w-5 text-primary" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.certifications.map((cert) => (
                  <div key={cert.id} className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-sm">{cert.name}</h4>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    {cert.issuer && (
                      <p className="text-xs text-muted-foreground">
                        {cert.issuer}
                      </p>
                    )}
                    {cert.issueDate && (
                      <p className="text-xs text-muted-foreground">
                        Issued {formatDate(cert.issueDate)}
                        {cert.expiryDate &&
                          ` • Expires ${formatDate(cert.expiryDate)}`}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Achievements */}
          {profile.achievements.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-5 w-5 text-primary" />
                  Achievements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {profile.achievements.map((achievement) => (
                  <div key={achievement.id} className="space-y-1">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    {achievement.issuer && (
                      <p className="text-xs text-muted-foreground">
                        {achievement.issuer}
                      </p>
                    )}
                    {achievement.date && (
                      <p className="text-xs text-muted-foreground">
                        {formatDate(achievement.date)}
                      </p>
                    )}
                    {achievement.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {achievement.description}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Languages */}
          {profile.languages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Languages className="h-5 w-5 text-primary" />
                  Languages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.languages.map((lang) => (
                    <Badge key={lang.id} variant="outline">
                      {lang.name}
                      {lang.proficiency && (
                        <span className="ml-1 text-xs opacity-70">
                          • {lang.proficiency}
                        </span>
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hobbies */}
          {profile.hobbies.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Heart className="h-5 w-5 text-primary" />
                  Hobbies & Interests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.hobbies.map((hobby, index) => (
                    <Badge key={index} variant="secondary">
                      {hobby}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Personal Info */}
          {(profile.nationality ||
            profile.visaStatus ||
            profile.dateOfBirth) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="h-5 w-5 text-primary" />
                  Personal Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {profile.nationality && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nationality</span>
                    <span>{profile.nationality}</span>
                  </div>
                )}
                {profile.visaStatus && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Visa Status</span>
                    <span>{profile.visaStatus}</span>
                  </div>
                )}
                {profile.dateOfBirth && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date of Birth</span>
                    <span>
                      {new Intl.DateTimeFormat("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(profile.dateOfBirth))}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
