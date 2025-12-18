import { redirect } from "next/navigation";
import { checkAuth } from "@/lib/auth-check";
import { ROUTES } from "@/lib/constants";
import { getFullProfile } from "@/lib/db/profile";
import { DashboardHeader } from "@/components/dashboard";
import { ProfileEditor, EmptyProfileState } from "@/components/profile-editor";

export default async function ProfileViewPage() {
  const session = await checkAuth();
  if (!session) {
    redirect(ROUTES.SIGN_IN);
  }

  const { user } = session;
  const profile = await getFullProfile(user.id);

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userName={user.name} userEmail={user.email} />
      <main className="container mx-auto p-4">
        {profile ? <ProfileEditor profile={profile} /> : <EmptyProfileState />}
      </main>
    </div>
  );
}
