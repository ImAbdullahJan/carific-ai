import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth-check";
import { ROUTES } from "@/lib/constants";
import { DashboardHeader } from "@/components/dashboard";
import { ResumeChat } from "@/components/dashboard/resume-generator";

export default async function ResumePage() {
  const session = await checkAuth();
  if (!session) {
    redirect(ROUTES.SIGN_IN);
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader
        userName={session.user.name}
        userEmail={session.user.email}
      />
      <main>
        <ResumeChat />
      </main>
    </div>
  );
}
