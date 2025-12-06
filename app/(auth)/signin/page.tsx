"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAppForm } from "@/hooks/form";
import { authClient } from "@/lib/auth-client";
import { signInSchema } from "@/lib/validations/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { FieldGroup } from "@/components/ui/field";

export default function SignInPage() {
  const router = useRouter();
  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    validators: {
      onSubmit: signInSchema,
    },
    onSubmit: async ({ value }) => {
      return await authClient.signIn.email(
        {
          email: value.email,
          password: value.password,
          rememberMe: value.rememberMe,
        },
        {
          onSuccess: () => {
            toast.success("Signed in successfully");
            router.push("/dashboard");
          },
          onError: (ctx) => {
            if (ctx.error.status === 403) {
              toast("Please verify your email address");
            } else {
              toast.error(ctx.error.message);
            }
          },
        }
      );
    },
  });

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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.AppField name="email">
            {(field) => (
              <field.TextField
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
              />
            )}
          </form.AppField>
          <form.AppField name="password">
            {(field) => (
              <field.TextField
                label="Password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            )}
          </form.AppField>
          <form.AppField name="rememberMe">
            {(field) => <field.CheckboxField label="Remember me" />}
          </form.AppField>
        </FieldGroup>
        <form.AppForm>
          <form.SubmitButton
            label="Sign in"
            loadingLabel="Signing in..."
            className="w-full mt-6"
          />
        </form.AppForm>
      </form>
    </AuthCard>
  );
}
