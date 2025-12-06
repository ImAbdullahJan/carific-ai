import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants";

export async function checkAuth(disableCookieCache = false) {
  return auth.api.getSession({
    headers: await headers(),
    query: {
      disableCookieCache,
    },
  });
}

export async function checkAuthAndRedirect({
  redirectUrl = ROUTES.DASHBOARD,
  disableCookieCache = false,
}: {
  redirectUrl?: string;
  disableCookieCache?: boolean;
} = {}) {
  const session = await checkAuth(disableCookieCache);
  if (session) {
    redirect(redirectUrl);
  }
}
