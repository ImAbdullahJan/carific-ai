import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth-check";
import { ROUTES } from "@/lib/constants";
import { DashboardHeader } from "@/components/dashboard";
import { ResumeTailorPage } from "@/components/dashboard/resume-tailor";
import { getFullProfile } from "@/lib/db/profile";
import { profileToResume } from "@/lib/profile-transformation";
import { getResumeById } from "@/lib/db/resume";
import {
  getOrCreateChatForResume,
  loadChat,
  getPlanSteps,
} from "@/lib/db/tailoring-chat";
import type { ResumeData } from "@/lib/types/resume";

export default async function ResumeTailorPageRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await checkAuth();
  if (!session) {
    redirect(ROUTES.SIGN_IN);
  }

  const profile = await getFullProfile(session.user.id);
  if (!profile) {
    redirect(ROUTES.PROFILE);
  }

  // Get the resume by ID
  const resume = await getResumeById((await params).id);
  if (!resume || resume.profileId !== profile.id) {
    redirect("/dashboard/resume");
  }

  // Use the persisted resume content (snapshot) if available, otherwise fall back to profile data
  const resumeData =
    (resume.content as unknown as ResumeData) || profileToResume(profile);

  // Get or create a tailoring chat for this resume (1:1 relationship)
  const chatId = await getOrCreateChatForResume(resume.id);
  const initialMessages = await loadChat(chatId);
  const initialPlanSteps = await getPlanSteps(chatId);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main>
        <ResumeTailorPage
          initialProfile={resumeData}
          resumeId={resume.id}
          chatId={chatId}
          initialMessages={initialMessages}
          initialPlanSteps={initialPlanSteps}
        />
      </main>
    </div>
  );
}
