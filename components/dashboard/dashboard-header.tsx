"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";

interface DashboardHeaderProps {
  userName: string | null;
  userEmail: string;
}

export function DashboardHeader({ userName, userEmail }: DashboardHeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push(ROUTES.SIGN_IN);
        },
        onError: (ctx) => {
          toast.error("Failed to sign out. Please try again.");
          console.error("Sign out error:", ctx.error);
        },
      },
    });
  };

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-6 py-2 flex items-center justify-between">
        <Link
          href={ROUTES.DASHBOARD}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="rounded-lg bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Carific.ai</h1>
            <p className="text-xs text-muted-foreground">
              AI-powered resume generator
            </p>
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.PROFILE_VIEW}>My Profile</Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.RESUMES}>My Resumes</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground hidden sm:block border-l pl-4 ml-2">
            {userName || userEmail}
          </p>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}
