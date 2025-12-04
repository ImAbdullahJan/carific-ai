import { siteConfig, footerContent } from "@/config/landing";

export function Footer() {
  return (
    <footer className="max-w-6xl mx-auto px-6 py-8 border-t mt-10">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="font-semibold">{siteConfig.name}</div>
          <div className="text-sm text-muted-foreground mt-1">
            {footerContent.tagline}
          </div>
        </div>
        <div className="flex gap-4 items-center">
          {footerContent.links.map((link) => (
            <a
              key={link.label}
              className="text-sm hover:underline"
              href={link.href}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>

      <div className="mt-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name} - All rights reserved
      </div>
    </footer>
  );
}
