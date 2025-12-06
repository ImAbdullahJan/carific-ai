import { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

import { AuthCard } from "@/components/auth/auth-card";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Welcome - Carific AI",
  description: "Check your email to verify your account",
};

export default function WelcomePage() {
  return (
    <AuthCard
      title="Check your email"
      description="We've sent you a verification link to complete your registration"
    >
      <div className="flex flex-col items-center gap-6 py-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-8 w-8 text-primary" />
        </div>
        <p className="text-center text-sm text-muted-foreground">
          Click the link in your email to verify your account. If you don&apos;t
          see it, check your spam folder.
        </p>
        <Button asChild variant="outline" className="w-full">
          <Link href={ROUTES.SIGN_IN}>Back to sign in</Link>
        </Button>
      </div>
    </AuthCard>
  );
}
