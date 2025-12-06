"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { useAppForm } from "@/hooks/form";
import { authClient } from "@/lib/auth-client";
import { signInSchema } from "@/lib/validations/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>
      <CardContent>
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
      </CardContent>
      <CardFooter className="flex flex-col">
        <p className="text-sm text-muted-foreground text-center">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
