"use client";

import { CheckCircle2, XCircle, AlertCircle, LayoutList } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SectionFeedback } from "@/lib/validations/resume-analysis";
import { cn } from "@/lib/utils";

interface SectionFeedbackListProps {
  sections?: SectionFeedback[];
}

export function SectionFeedbackList({ sections }: SectionFeedbackListProps) {
  if (!sections || sections.length === 0) return null;

  const getStatusIcon = (status: SectionFeedback["status"]) => {
    switch (status) {
      case "Present":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "Missing":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "Incomplete":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
    }
  };

  const getStatusStyles = (status: SectionFeedback["status"]) => {
    switch (status) {
      case "Present":
        return "border-green-500/20 bg-green-500/5";
      case "Missing":
        return "border-red-500/20 bg-red-500/5";
      case "Incomplete":
        return "border-amber-500/20 bg-amber-500/5";
    }
  };

  // Sort: Missing first, then Incomplete, then Present
  const sortedSections = [...sections].sort((a, b) => {
    const order = { Missing: 0, Incomplete: 1, Present: 2 };
    return order[a.status] - order[b.status];
  });

  const hasIssues = sections.some((s) => s.status !== "Present");

  if (!hasIssues) {
    return null; // Don't show if all sections are complete
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <LayoutList className="h-5 w-5 text-blue-500" />
          Section Completeness
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {sortedSections.map((section, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border",
                getStatusStyles(section.status)
              )}
            >
              <div className="mt-0.5">{getStatusIcon(section.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{section.section}</span>
                  <span
                    className={cn(
                      "text-xs",
                      section.status === "Present"
                        ? "text-green-600"
                        : section.status === "Missing"
                          ? "text-red-600"
                          : "text-amber-600"
                    )}
                  >
                    {section.status}
                  </span>
                </div>
                {section.status !== "Present" && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {section.feedback}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
