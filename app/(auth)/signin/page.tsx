import { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/signin-form";
import { checkAuthAndRedirect } from "@/lib/auth-check";

export const metadata: Metadata = {
  title: "Sign In - Carific AI",
  description: "Sign in to your Carific AI account",
};

export default async function SignInPage() {
  await checkAuthAndRedirect({ disableCookieCache: true });

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to your account to continue"
      footer={{
        text: "Don't have an account?",
        linkText: "Sign up",
        linkHref: "/signup",
      }}
    >
      <SignInForm />
    </AuthCard>
  );
}
