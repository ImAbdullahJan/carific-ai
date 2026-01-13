"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  FileText,
  UserCircle,
  Sparkles,
  PlusCircle,
  ArrowRight,
  Briefcase,
  GraduationCap,
  Award,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/lib/constants";
import type { getFullProfile } from "@/lib/db/profile";
import type { getResumesForProfile } from "@/lib/db/resume";

type FullProfile = NonNullable<Awaited<ReturnType<typeof getFullProfile>>>;
type ResumesList = Awaited<ReturnType<typeof getResumesForProfile>>;

interface DashboardContentProps {
  profile: FullProfile | null;
  resumes: ResumesList;
}

export function DashboardContent({ profile, resumes }: DashboardContentProps) {
  if (!profile) {
    return <NoProfileView />;
  }
  return <ResumeGeneratorView profile={profile} resumes={resumes} />;
}

function NoProfileView() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-3xl mx-auto space-y-8">
      <div className="space-y-4">
        <div className="bg-primary/10 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
          <FileText className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          Welcome to Carific.ai
        </h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Create tailored, ATS-optimized resumes in minutes with our AI-powered
          platform.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 w-full text-left">
        <Card>
          <CardHeader>
            <UserCircle className="h-10 w-10 text-primary mb-2" />
            <CardTitle>1. Create Profile</CardTitle>
            <CardDescription>
              Upload your existing resume to automatically extract and build
              your digital profile.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <Sparkles className="h-10 w-10 text-primary mb-2" />
            <CardTitle>2. Tailor Content</CardTitle>
            <CardDescription>
              Our AI analyzes job descriptions and customizes your resume for
              specific roles.
            </CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <FileText className="h-10 w-10 text-primary mb-2" />
            <CardTitle>3. Export PDF</CardTitle>
            <CardDescription>
              Download perfectly formatted, ATS-friendly PDF resumes ready for
              application.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Button size="lg" className="h-12 px-8 text-lg" asChild>
        <Link href={ROUTES.PROFILE}>
          <UserCircle className="mr-2 h-5 w-5" />
          Create Your Profile
        </Link>
      </Button>
    </div>
  );
}

function ResumeGeneratorView({
  profile,
  resumes,
}: {
  profile: FullProfile;
  resumes: ResumesList;
}) {
  // Calculate completion percentage or other stats if needed
  const experienceCount = profile.workExperiences.length;
  const projectCount = profile.projects.length;
  const skillsCount = profile.skills.length;

  return (
    <div className="space-y-8">
      {/* Profile Summary Section */}
      <section className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2 bg-gradient-to-br from-card to-secondary/10 border-primary/20 shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-2xl font-bold">
                {profile.displayName}
              </CardTitle>
              <CardDescription className="text-base mt-1">
                {profile.headline || "No headline set"}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={ROUTES.PROFILE_VIEW}>
                Edit Profile <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 px-3 py-1.5 rounded-md border">
                <Briefcase className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  {experienceCount}
                </span>{" "}
                Experiences
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 px-3 py-1.5 rounded-md border">
                <GraduationCap className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  {profile.educations.length}
                </span>{" "}
                Educations
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-background/50 px-3 py-1.5 rounded-md border">
                <Award className="h-4 w-4 text-primary" />
                <span className="font-medium text-foreground">
                  {skillsCount}
                </span>{" "}
                Skills
              </div>
            </div>
            {profile.bio && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-2 text-muted-foreground uppercase tracking-wider">
                  Bio
                </h4>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {profile.bio}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Action Card */}
        <Card className="flex flex-col justify-center items-center text-center p-6 border-dashed border-2 bg-muted/20">
          <div className="bg-primary/10 p-3 rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">New Job Application?</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Generate a tailored resume for a specific job description.
          </p>
          <Button size="lg" className="w-full" asChild>
            <Link href={ROUTES.RESUMES}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Generate Resume
            </Link>
          </Button>
        </Card>
      </section>

      {/* Resumes List Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Your Resumes</h2>
          {resumes.length > 0 && (
            <Button variant="ghost" asChild>
              <Link href={ROUTES.RESUMES}>
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {resumes.length === 0 ? (
          <Card className="bg-muted/50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium">No resumes yet</h3>
              <p className="text-muted-foreground max-w-sm text-center mt-2 mb-6">
                Tailor your first resume to see it here.
              </p>
              <Button variant="outline" asChild>
                <Link href={ROUTES.RESUMES}>Get Started</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumes.slice(0, 3).map((resume) => (
              <Link key={resume.id} href={`/dashboard/resume/${resume.id}`}>
                <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50 group h-full">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start gap-2">
                      <CardTitle className="text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                        {resume.title}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {resume.tailoringChat?._count.messages ?? 0} msgs
                      </Badge>
                    </div>
                    {resume.targetJobTitle && (
                      <CardDescription className="line-clamp-1">
                        Target: {resume.targetJobTitle}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      Updated{" "}
                      {format(new Date(resume.updatedAt), "MMM d, yyyy")}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
