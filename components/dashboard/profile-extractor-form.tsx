"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Sparkles,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Languages,
  Heart,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ResumeUpload } from "@/components/resume-upload";
import type { ResumeExtraction } from "@/lib/validations/resume-extraction";

interface ExtractedProfileViewProps {
  data: ResumeExtraction;
  saved: boolean;
}

function ExtractedProfileView({ data, saved }: ExtractedProfileViewProps) {
  return (
    <ScrollArea className="h-[calc(100vh-200px)]">
      <div className="space-y-6 pr-4">
        {/* Status Banner */}
        <div
          className={`flex items-center justify-between gap-2 p-3 rounded-lg ${
            saved
              ? "bg-green-500/10 text-green-600"
              : "bg-yellow-500/10 text-yellow-600"
          }`}
        >
          <div className="flex items-center gap-2">
            {saved ? (
              <>
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Profile saved successfully
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5" />
                <span className="text-sm font-medium">
                  Extracted but not saved
                </span>
              </>
            )}
          </div>
          {saved && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/profile/view">
                <Eye className="h-4 w-4 mr-1" />
                View Full Profile
              </Link>
            </Button>
          )}
        </div>

        {/* Contact Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Name:</span>
                <p className="font-medium">{data.displayName}</p>
              </div>
              {data.headline && (
                <div>
                  <span className="text-muted-foreground">Headline:</span>
                  <p className="font-medium">{data.headline}</p>
                </div>
              )}
              {data.email && (
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{data.email}</p>
                </div>
              )}
              {data.phone && (
                <div>
                  <span className="text-muted-foreground">Phone:</span>
                  <p className="font-medium">{data.phone}</p>
                </div>
              )}
              {data.location && (
                <div>
                  <span className="text-muted-foreground">Location:</span>
                  <p className="font-medium">{data.location}</p>
                </div>
              )}
              {data.website && (
                <div>
                  <span className="text-muted-foreground">Website:</span>
                  <p className="font-medium">{data.website}</p>
                </div>
              )}
            </div>
            {data.bio && (
              <div className="pt-2">
                <span className="text-muted-foreground text-sm">Summary:</span>
                <p className="text-sm mt-1">{data.bio}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Work Experience */}
        {data.workExperiences.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Briefcase className="h-5 w-5" />
                Work Experience
                <Badge variant="secondary" className="ml-auto">
                  {data.workExperiences.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.workExperiences.map((exp, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{exp.position}</p>
                      <p className="text-sm text-muted-foreground">
                        {exp.company}
                        {exp.location && ` • ${exp.location}`}
                      </p>
                    </div>
                    <Badge variant={exp.current ? "default" : "outline"}>
                      {exp.current ? "Current" : exp.endDate || "Past"}
                    </Badge>
                  </div>
                  {exp.bullets.length > 0 && (
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mt-2">
                      {exp.bullets.slice(0, 3).map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                      {exp.bullets.length > 3 && (
                        <li className="text-primary">
                          +{exp.bullets.length - 3} more...
                        </li>
                      )}
                    </ul>
                  )}
                  {index < data.workExperiences.length - 1 && (
                    <Separator className="mt-3" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Education */}
        {data.educations.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <GraduationCap className="h-5 w-5" />
                Education
                <Badge variant="secondary" className="ml-auto">
                  {data.educations.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.educations.map((edu, index) => (
                <div key={index} className="space-y-1">
                  <p className="font-medium">{edu.degree}</p>
                  <p className="text-sm text-muted-foreground">
                    {edu.school}
                    {edu.fieldOfStudy && ` • ${edu.fieldOfStudy}`}
                  </p>
                  {index < data.educations.length - 1 && (
                    <Separator className="mt-2" />
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Code className="h-5 w-5" />
                Skills
                <Badge variant="secondary" className="ml-auto">
                  {data.skills.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <Badge key={index} variant="outline">
                    {skill.name}
                    {skill.level && (
                      <span className="ml-1 text-muted-foreground">
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
        {data.certifications && data.certifications.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5" />
                Certifications
                <Badge variant="secondary" className="ml-auto">
                  {data.certifications.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{cert.name}</p>
                    {cert.issuer && (
                      <p className="text-xs text-muted-foreground">
                        {cert.issuer}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Languages */}
        {data.languages && data.languages.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Languages className="h-5 w-5" />
                Languages
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.languages.map((lang, index) => (
                  <Badge key={index} variant="outline">
                    {lang.name}
                    {lang.proficiency && (
                      <span className="ml-1 text-muted-foreground">
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
        {data.hobbies && data.hobbies.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="h-5 w-5" />
                Hobbies & Interests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.hobbies.map((hobby, index) => (
                  <Badge key={index} variant="secondary">
                    {hobby}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
}

export function ProfileExtractorForm() {
  const [resumeText, setResumeText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionResult, setExtractionResult] = useState<{
    data: ResumeExtraction;
    saved: boolean;
    profileId?: string | null;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractProfile = async () => {
    if (!resumeText || resumeText.length < 50) {
      toast.error("Please provide a resume with at least 50 characters");
      return;
    }

    setIsExtracting(true);
    setError(null);
    setExtractionResult(null);

    try {
      const response = await fetch("/api/extract-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          saveToProfile: true,
        }),
      });

      const data = await response.json();

      if (!response.ok && response.status !== 207) {
        throw new Error(data.error || "Failed to extract profile");
      }

      setExtractionResult({
        data: data.data,
        saved: data.saved,
        profileId: data.profileId,
      });

      if (data.saved) {
        toast.success("Profile extracted and saved!");
      } else {
        toast.warning("Profile extracted but could not be saved");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setIsExtracting(false);
    }
  };

  const canExtract = resumeText.length >= 50 && !isExtracting;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Resume Input */}
      <div className="grid grid-rows-[auto_1fr_auto] gap-4 h-[calc(100vh-150px)]">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Upload Your Resume</h2>
          <p className="text-sm text-muted-foreground">
            Upload or paste your resume to extract your professional profile.
            This will create your master profile that can be used to generate
            tailored resumes.
          </p>
        </div>

        <ScrollArea className="h-full min-h-[400px]">
          <ResumeUpload
            value={resumeText}
            onChange={(text) => setResumeText(text)}
            disabled={isExtracting}
          />
        </ScrollArea>

        <Button
          size="lg"
          className="w-full"
          onClick={extractProfile}
          disabled={!canExtract}
        >
          {isExtracting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Extracting Profile...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Extract & Save Profile
            </>
          )}
        </Button>
      </div>

      {/* Right Column - Extracted Profile */}
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Extracted Profile</h2>
          <p className="text-sm text-muted-foreground">
            Preview of your extracted professional profile data.
          </p>
        </div>

        {isExtracting ? (
          <Card className="h-[calc(100vh-250px)] flex items-center justify-center">
            <CardContent className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">
                Analyzing your resume with AI...
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                This may take a few seconds
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="h-[calc(100vh-250px)] flex items-center justify-center border-destructive">
            <CardContent className="text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <p className="text-destructive font-medium">Extraction Failed</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={extractProfile}
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        ) : extractionResult ? (
          <ExtractedProfileView
            data={extractionResult.data}
            saved={extractionResult.saved}
          />
        ) : (
          <Card className="h-[calc(100vh-250px)] flex items-center justify-center">
            <CardContent className="text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Upload a resume to see your extracted profile
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
