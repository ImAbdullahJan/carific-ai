import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { heroContent, demoContent } from "@/config/landing";

export function Hero() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10 items-center">
      <div>
        <h2 className="text-4xl font-extrabold leading-tight">
          {heroContent.title}
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          {heroContent.description}
        </p>

        <div className="mt-6 flex gap-4">
          <Button size="lg" asChild>
            <Link href={heroContent.primaryCta.href}>
              {heroContent.primaryCta.label}
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <a
              href={heroContent.secondaryCta.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              {heroContent.secondaryCta.label}
            </a>
          </Button>
        </div>

        <div className="mt-6 text-sm text-muted-foreground">
          <strong className="text-foreground">Open source</strong> • MIT License
          • Weekly public builds
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3 text-sm text-muted-foreground">
          {heroContent.stats.map((stat) => (
            <div key={stat.label}>
              <div className="font-semibold text-foreground">{stat.value}</div>
              <div>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <DemoCard />
    </section>
  );
}

function DemoCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{demoContent.title}</CardTitle>
        <CardDescription>{demoContent.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-md">
          <label className="block text-xs text-muted-foreground mb-2">
            Paste resume
          </label>
          <Textarea
            className="h-24 resize-none"
            placeholder={demoContent.resumePlaceholder}
          />
        </div>

        <div className="bg-muted p-4 rounded-md">
          <label className="block text-xs text-muted-foreground mb-2">
            Paste job description
          </label>
          <Textarea
            className="h-24 resize-none"
            placeholder={demoContent.jobPlaceholder}
          />
        </div>

        <div className="flex gap-2">
          <Button>Analyze</Button>
          <Button variant="outline">Reset</Button>
        </div>

        <div className="text-sm text-muted-foreground">
          <strong className="text-foreground">Example result:</strong>
          <div className="mt-2 p-3 bg-background border rounded-md">
            <div className="text-sm">
              Match score:{" "}
              <span className="font-semibold">
                {demoContent.exampleResult.score}
              </span>
            </div>
            <ul className="mt-2 text-sm list-disc ml-5">
              {demoContent.exampleResult.suggestions.map((suggestion, i) => (
                <li key={i}>{suggestion}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
