import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth-check";
import { ROUTES } from "@/lib/constants";
import { DashboardHeader } from "@/components/dashboard";
import { ResumeTailorPage } from "@/components/dashboard/resume-tailor";
import { getFullProfile } from "@/lib/db/profile";
import { profileToResume } from "@/lib/profile-transformation";
import prisma from "@/lib/prisma";

export default async function ResumePage() {
  const session = await checkAuth();
  if (!session) {
    redirect(ROUTES.SIGN_IN);
  }

  const profile = await getFullProfile(session.user.id);
  if (!profile) {
    redirect(ROUTES.PROFILE);
  }

  const resumeData = profileToResume(profile);

  const resume = await prisma.resume.create({
    data: {
      profileId: profile.id,
      title: "My Resume",
      status: "DRAFT",
      content: resumeData,
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main>
        <ResumeTailorPage initialProfile={resumeData} resumeId={resume.id} />
      </main>
    </div>
  );
}
