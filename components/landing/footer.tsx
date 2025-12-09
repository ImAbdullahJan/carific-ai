import { Github, Twitter, Linkedin } from "lucide-react";
import { siteConfig, footerContent, socialLinks } from "@/config/landing";

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
        <div className="flex gap-6 items-center">
          <div className="flex gap-4 items-center">
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Twitter/X"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
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
      </div>

      <div className="mt-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} {siteConfig.name} - All rights reserved
      </div>
    </footer>
  );
}
