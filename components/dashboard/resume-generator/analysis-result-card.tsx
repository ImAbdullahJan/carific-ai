"use client";

import { UIToolInvocation } from "ai";
import {
  CheckCircle2Icon,
  XCircleIcon,
  AlertCircleIcon,
  TargetIcon,
  LightbulbIcon,
  FileTextIcon,
  RulerIcon,
  Loader2Icon,
} from "lucide-react";

import { analyzeJobMatchTool } from "@/ai/tool";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

export type AnalysisResultCardProps = {
  part: UIToolInvocation<typeof analyzeJobMatchTool>;
};

const scoreColors: Record<string, string> = {
  Poor: "text-red-600 dark:text-red-400",
  Fair: "text-orange-600 dark:text-orange-400",
  Good: "text-yellow-600 dark:text-yellow-400",
  Strong: "text-green-600 dark:text-green-400",
  Excellent: "text-emerald-600 dark:text-emerald-400",
};

const scoreProgressColors: Record<string, string> = {
  Poor: "[&>div]:bg-red-500",
  Fair: "[&>div]:bg-orange-500",
  Good: "[&>div]:bg-yellow-500",
  Strong: "[&>div]:bg-green-500",
  Excellent: "[&>div]:bg-emerald-500",
};

const importanceBadgeVariants: Record<
  string,
  "destructive" | "default" | "secondary"
> = {
  Critical: "destructive",
  Important: "default",
  "Nice to Have": "secondary",
};

const sectionStatusIcons = {
  Present: CheckCircle2Icon,
  Missing: XCircleIcon,
  Incomplete: AlertCircleIcon,
};

const sectionStatusColors = {
  Present: "text-green-600 dark:text-green-400",
  Missing: "text-red-600 dark:text-red-400",
  Incomplete: "text-yellow-600 dark:text-yellow-400",
};

export function AnalysisResultCard({ part }: AnalysisResultCardProps) {
  if (part.state !== "output-available") {
    return (
      <div
        key={part.toolCallId}
        className="flex items-center gap-2 text-muted-foreground"
      >
        <Loader2Icon className="size-4 animate-spin" />
        <span>Analyzing job match...</span>
      </div>
    );
  }
  const { jobTitle, analysis } = part.output;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Analysis Results</CardTitle>
            <CardDescription>Match analysis for: {jobTitle}</CardDescription>
          </div>
          <div className="text-right">
            <div
              className={cn(
                "text-3xl font-bold",
                scoreColors[analysis.scoreLabel]
              )}
            >
              {analysis.score}
            </div>
            <Badge
              variant="outline"
              className={cn("mt-1", scoreColors[analysis.scoreLabel])}
            >
              {analysis.scoreLabel}
            </Badge>
          </div>
        </div>
        <Progress
          value={analysis.score}
          className={cn("mt-3 h-2", scoreProgressColors[analysis.scoreLabel])}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          {analysis.scoreSummary}
        </p>
      </CardHeader>

      <CardContent>
        <Accordion
          type="multiple"
          defaultValue={["priority", "keywords"]}
          className="w-full"
        >
          {/* Priority Actions */}
          <AccordionItem value="priority">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <TargetIcon className="size-4 text-primary" />
                Priority Actions ({analysis.priorityActions.length})
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2">
                {analysis.priorityActions.map((action, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {i + 1}
                    </span>
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* Missing Keywords */}
          <AccordionItem value="keywords">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <LightbulbIcon className="size-4 text-yellow-500" />
                Missing Keywords ({analysis.missingKeywords.length})
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3">
                {analysis.missingKeywords.map((kw, i) => (
                  <div
                    key={i}
                    className="rounded-lg border bg-muted/30 p-3 text-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{kw.keyword}</span>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {kw.category}
                        </Badge>
                        <Badge
                          variant={importanceBadgeVariants[kw.importance]}
                          className="text-xs"
                        >
                          {kw.importance}
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-1 text-muted-foreground">
                      Add to: {kw.whereToAdd}
                    </p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Bullet Fixes */}
          {analysis.bulletFixes.length > 0 && (
            <AccordionItem value="bullets">
              <AccordionTrigger className="text-sm font-medium">
                <div className="flex items-center gap-2">
                  <FileTextIcon className="size-4 text-blue-500" />
                  Suggested Improvements ({analysis.bulletFixes.length})
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  {analysis.bulletFixes.map((fix, i) => (
                    <div key={i} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-muted-foreground">
                          {fix.location}
                        </span>
                        <Badge
                          variant={
                            fix.impact === "High" ? "destructive" : "secondary"
                          }
                          className="text-xs"
                        >
                          {fix.impact} Impact
                        </Badge>
                      </div>
                      <div className="mt-2 space-y-2">
                        <div className="rounded bg-red-50 p-2 dark:bg-red-950/30">
                          <span className="text-xs font-medium text-red-600 dark:text-red-400">
                            Original:
                          </span>
                          <p className="mt-0.5 text-red-700 dark:text-red-300">
                            {fix.original}
                          </p>
                        </div>
                        <div className="rounded bg-green-50 p-2 dark:bg-green-950/30">
                          <span className="text-xs font-medium text-green-600 dark:text-green-400">
                            Improved:
                          </span>
                          <p className="mt-0.5 text-green-700 dark:text-green-300">
                            {fix.improved}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          <strong>Why:</strong> {fix.reason}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Section Feedback */}
          <AccordionItem value="sections">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="size-4 text-green-500" />
                Section Review
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {analysis.sectionFeedback.map((section, i) => {
                  const Icon = sectionStatusIcons[section.status];
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                    >
                      <Icon
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          sectionStatusColors[section.status]
                        )}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{section.section}</span>
                          <Badge
                            variant={
                              section.status === "Present"
                                ? "default"
                                : section.status === "Missing"
                                  ? "destructive"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {section.status}
                          </Badge>
                        </div>
                        {section.feedback !== "Complete" && (
                          <p className="mt-1 text-muted-foreground">
                            {section.feedback}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Length Assessment */}
          <AccordionItem value="length">
            <AccordionTrigger className="text-sm font-medium">
              <div className="flex items-center gap-2">
                <RulerIcon className="size-4 text-purple-500" />
                Length Assessment
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="rounded-lg border p-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      analysis.lengthAssessment.currentLength === "Appropriate"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {analysis.lengthAssessment.currentLength}
                  </Badge>
                </div>
                <p className="mt-2 text-muted-foreground">
                  {analysis.lengthAssessment.recommendation}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
