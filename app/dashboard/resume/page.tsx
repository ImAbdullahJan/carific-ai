import { redirect } from "next/navigation";
import Link from "next/link";
import { checkAuth } from "@/lib/auth-check";
import { ROUTES } from "@/lib/constants";
import { DashboardHeader } from "@/components/dashboard";
import { getFullProfile } from "@/lib/db/profile";
import { getResumesForProfile, createResume } from "@/lib/db/resume";
import { profileToResume } from "@/lib/profile-transformation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, FileText, MessageSquare } from "lucide-react";

export default async function ResumeListPage() {
  const session = await checkAuth();
  if (!session) {
    redirect(ROUTES.SIGN_IN);
  }

  const profile = await getFullProfile(session.user.id);
  if (!profile) {
    redirect(ROUTES.PROFILE);
  }

  const resumes = await getResumesForProfile(profile.id);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Resumes</h1>
            <p className="text-muted-foreground mt-2">
              Create and manage your tailored resumes
            </p>
          </div>
          <form
            action={async () => {
              "use server";
              const profile = await getFullProfile(session.user.id);
              if (!profile) return;

              const resumeData = profileToResume(profile);
              const newResume = await createResume(
                profile.id,
                `Resume ${resumes.length + 1}`,
                resumeData
              );

              redirect(`/dashboard/resume/${newResume.id}`);
            }}
          >
            <Button type="submit" size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              New Resume
            </Button>
          </form>
        </div>

        {resumes.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No resumes yet</h3>
              <p className="text-muted-foreground text-center mb-6 max-w-md">
                Create your first tailored resume to get started. Each resume
                has its own AI chat session to help you customize it for
                specific job applications.
              </p>
              <form
                action={async () => {
                  "use server";
                  const profile = await getFullProfile(session.user.id);
                  if (!profile) return;

                  const resumeData = profileToResume(profile);
                  const newResume = await createResume(
                    profile.id,
                    "My First Resume",
                    resumeData
                  );

                  redirect(`/dashboard/resume/${newResume.id}`);
                }}
              >
                <Button type="submit" size="lg">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  Create First Resume
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => (
              <Link key={resume.id} href={`/dashboard/resume/${resume.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-start justify-between">
                      <span className="line-clamp-1">{resume.title}</span>
                      <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0 ml-2" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {resume.targetJobTitle && (
                        <p className="line-clamp-1">
                          <span className="font-medium">Target:</span>{" "}
                          {resume.targetJobTitle}
                        </p>
                      )}
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>
                            {resume.tailoringChat?._count.messages || 0}{" "}
                            messages
                          </span>
                        </div>
                        <div className="text-xs">
                          {new Date(resume.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
