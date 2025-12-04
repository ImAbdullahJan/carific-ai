import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { contributeContent } from "@/config/landing";

export function Contribute() {
  return (
    <section id="contribute" className="max-w-6xl mx-auto px-6 py-12">
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-2xl">{contributeContent.title}</CardTitle>
          <CardDescription>{contributeContent.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {contributeContent.buttons.map((button) => (
              <Button key={button.label} variant={button.variant} asChild>
                <a href={button.href}>{button.label}</a>
              </Button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-muted-foreground">
            {contributeContent.info.map((item) => (
              <div key={item.title}>
                <strong className="text-foreground">{item.title}</strong>
                <div className="mt-1">{item.description}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
