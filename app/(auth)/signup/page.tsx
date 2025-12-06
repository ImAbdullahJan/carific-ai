import { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/signup-form";
import { checkAuthAndRedirect } from "@/lib/auth-check";

export const metadata: Metadata = {
  title: "Sign Up - Carific AI",
  description: "Create your Carific AI account",
};

export default async function SignUpPage() {
  await checkAuthAndRedirect();

  return (
    <AuthCard
      title="Create an account"
      description="Get started with your career development journey"
      footer={{
        text: "Already have an account?",
        linkText: "Sign in",
        linkHref: "/signin",
      }}
    >
      <SignUpForm />
    </AuthCard>
  );
}
