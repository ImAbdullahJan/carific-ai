import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth-check";
import { ROUTES } from "@/lib/constants";
import { DashboardHeader, ResumeAnalyzerForm } from "@/components/dashboard";

export default async function DashboardPage() {
  const session = await checkAuth();
  if (!session) {
    redirect(ROUTES.SIGN_IN);
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={user.name} userEmail={user.email} />
      <main className="max-w-7xl mx-auto px-6 py-8">
        <ResumeAnalyzerForm />
      </main>
    </div>
  );
}
