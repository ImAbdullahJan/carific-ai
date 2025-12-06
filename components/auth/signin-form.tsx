"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAppForm } from "@/hooks/form";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import { signInSchema } from "@/lib/validations/auth";
import { FieldGroup } from "@/components/ui/field";

export function SignInForm() {
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
            router.push(ROUTES.DASHBOARD);
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
  );
}
