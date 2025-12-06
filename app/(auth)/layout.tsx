import Link from "next/link";
import { siteConfig } from "@/config/landing";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="p-6">
        <Link
          href="/"
          className="flex items-center gap-3 w-fit"
          aria-label="Go to homepage"
        >
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
            {siteConfig.logo}
          </div>
          <span className="text-lg font-semibold">{siteConfig.name}</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        {children}
      </main>
    </div>
  );
}
