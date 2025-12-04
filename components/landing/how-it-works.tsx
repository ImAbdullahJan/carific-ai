import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { howItWorksContent } from "@/config/landing";

export function HowItWorks() {
  return (
    <section id="how" className="max-w-4xl mx-auto px-6 py-10">
      <h3 className="text-2xl font-bold">{howItWorksContent.title}</h3>
      <div className="mt-6 grid sm:grid-cols-3 gap-6">
        {howItWorksContent.steps.map((step) => (
          <Card key={step.title}>
            <CardHeader>
              <CardTitle className="text-lg">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
