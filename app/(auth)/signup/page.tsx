"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAppForm } from "@/hooks/form";
import { authClient } from "@/lib/auth-client";
import { signUpSchema } from "@/lib/validations/auth";
import { AuthCard } from "@/components/auth/auth-card";
import { FieldGroup } from "@/components/ui/field";

export default function SignUpPage() {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signUpSchema,
    },
    onSubmit: async ({ value }) => {
      await authClient.signUp.email(
        {
          name: value.name,
          email: value.email,
          password: value.password,
        },
        {
          onSuccess: () => {
            toast.success(
              "Account created. Please check your email to verify."
            );
            router.push("/signin");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
          },
        }
      );
    },
  });

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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.AppField name="name">
            {(field) => (
              <field.TextField
                label="Name"
                placeholder="John Doe"
                autoComplete="name"
              />
            )}
          </form.AppField>
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
                description="Must be at least 8 characters"
                autoComplete="new-password"
              />
            )}
          </form.AppField>
        </FieldGroup>
        <form.AppForm>
          <form.SubmitButton
            label="Create account"
            loadingLabel="Creating account..."
            className="w-full mt-6"
          />
        </form.AppForm>
      </form>
    </AuthCard>
  );
}
