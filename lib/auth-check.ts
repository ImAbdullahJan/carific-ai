import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

const MAIN_DASHBOARD_REDIRECT_URL = "/dashboard";

export async function checkAuth(disableCookieCache = false) {
  return auth.api.getSession({
    headers: await headers(),
    query: {
      disableCookieCache,
    },
  });
}

export async function checkAuthAndRedirect({
  redirectUrl = MAIN_DASHBOARD_REDIRECT_URL,
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
