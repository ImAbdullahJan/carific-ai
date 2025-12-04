import { Button } from "@/components/ui/button";
import { siteConfig, navLinks } from "@/config/landing";

export function Header() {
  return (
    <header className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold">
          {siteConfig.logo}
        </div>
        <div>
          <h1 className="text-lg font-semibold">{siteConfig.name}</h1>
          <p className="text-xs text-muted-foreground">{siteConfig.tagline}</p>
        </div>
      </div>
      <nav className="hidden md:flex items-center gap-4">
        {navLinks.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className="text-sm hover:underline"
          >
            {link.label}
          </a>
        ))}
        <Button variant="outline" size="sm" asChild>
          <a href={siteConfig.githubUrl}>View on GitHub</a>
        </Button>
      </nav>
    </header>
  );
}
