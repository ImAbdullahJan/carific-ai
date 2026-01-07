import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth-check";
import { ROUTES } from "@/lib/constants";
import { DashboardHeader } from "@/components/dashboard";
import { ResumeTailorPage } from "@/components/dashboard/resume-tailor";
import { getFullProfile } from "@/lib/db/profile";
import { profileToResume } from "@/lib/profile-transformation";
import prisma from "@/lib/prisma";
import {
  createTailoringChat,
  getMostRecentChat,
  loadChat,
} from "@/lib/db/tailoring-chat";

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

  // Get or create a resume for this session
  let resume = await prisma.resume.findFirst({
    where: { profileId: profile.id, status: "DRAFT" },
    orderBy: { createdAt: "desc" },
  });

  if (!resume) {
    resume = await prisma.resume.create({
      data: {
        profileId: profile.id,
        title: "My Resume",
        status: "DRAFT",
        content: resumeData,
      },
    });
  }

  // Get or create a tailoring chat for this resume
  const chat = await getMostRecentChat(resume.id);
  let chatId: string;
  let initialMessages: Awaited<ReturnType<typeof loadChat>> = [];

  if (chat) {
    // Load existing messages
    chatId = chat.id;
    initialMessages = await loadChat(chat.id);
  } else {
    // Create a new chat
    chatId = await createTailoringChat(resume.id);
  }

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
        />
      </main>
    </div>
  );
}
