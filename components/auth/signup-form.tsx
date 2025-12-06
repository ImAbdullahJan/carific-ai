"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAppForm } from "@/hooks/form";
import { authClient } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";
import { signUpSchema } from "@/lib/validations/auth";
import { FieldGroup } from "@/components/ui/field";

export function SignUpForm() {
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
            router.push(ROUTES.WELCOME);
          },
          onError: (ctx) => {
            toast.error(ctx.error.message);
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
  );
}
