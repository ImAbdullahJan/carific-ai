import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { featuresContent } from "@/config/landing";

export function Features() {
  return (
    <section id="features" className="max-w-6xl mx-auto px-6 py-12">
      <h3 className="text-2xl font-bold">{featuresContent.title}</h3>
      <p className="mt-2 text-muted-foreground">
        {featuresContent.description}
      </p>

      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuresContent.items.map((feature) => (
          <Card
            key={feature.title}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <CardTitle className="text-base">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
              <div className="mt-4">
                <Badge variant="secondary">{feature.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
