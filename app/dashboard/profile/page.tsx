import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth-check";
import { ROUTES } from "@/lib/constants";
import { DashboardHeader, ProfileExtractorForm } from "@/components/dashboard";

export default async function ProfilePage() {
  const session = await checkAuth();
  if (!session) {
    redirect(ROUTES.SIGN_IN);
  }

  const { user } = session;

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={user.name} userEmail={user.email} />
      <main className="container mx-auto p-4">
        <ProfileExtractorForm />
      </main>
    </div>
  );
}
