"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Sparkles, LogOut, FileText } from "lucide-react";
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
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Resume Analyzer</h1>
            <p className="text-xs text-muted-foreground">
              AI-powered resume feedback
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href={ROUTES.PROFILE}>
              <FileText className="h-4 w-4 mr-2" />
              Resume Generator
            </Link>
          </Button>
          <p className="text-sm text-muted-foreground hidden sm:block">
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
