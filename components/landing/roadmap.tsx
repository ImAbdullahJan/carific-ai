import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { roadmapContent } from "@/config/landing";

export function Roadmap() {
  return (
    <section id="roadmap" className="max-w-6xl mx-auto px-6 py-10">
      <h3 className="text-2xl font-bold">{roadmapContent.title}</h3>
      <ol className="mt-4 space-y-4">
        {roadmapContent.milestones.map((milestone) => (
          <Card key={milestone.version}>
            <CardHeader>
              <CardTitle className="text-lg">{milestone.version}</CardTitle>
            </CardHeader>
            <CardContent>{milestone.description}</CardContent>
          </Card>
        ))}
      </ol>
    </section>
  );
}
