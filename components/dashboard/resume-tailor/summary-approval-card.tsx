"use client";

import { useState } from "react";
import { UIToolInvocation } from "ai";
import {
  CheckIcon,
  PencilIcon,
  SkipForwardIcon,
  SparklesIcon,
  Loader2Icon,
  LightbulbIcon,
} from "lucide-react";

import { approveSummaryTool } from "@/ai/tool/resume-tailor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { SummaryApproval } from "@/ai/tool/resume-tailor";

export type SummaryApprovalCardProps = {
  part: UIToolInvocation<typeof approveSummaryTool>;
  summaryData: {
    current: string | null;
    suggested: string;
    reasoning: string;
    keywordsIncorporated: string[];
    matchScore?: number;
    matchAnalysis?: string;
  };
  onSubmit: (data: SummaryApproval) => void;
};

export function SummaryApprovalCard({
  part,
  summaryData,
  onSubmit,
}: SummaryApprovalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [currentSummaryText, setCurrentSummaryText] = useState(
    summaryData?.suggested || ""
  );
  const [editValue, setEditValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (part.state === "output-available") {
    const { approved, customText: savedText } = part.output;
    return (
      <Card className="w-full max-w-2xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {approved ? (
              <CheckIcon className="size-5" />
            ) : (
              <SkipForwardIcon className="size-5" />
            )}
            <CardTitle className="text-base">
              {approved ? "Summary Approved" : "Summary Skipped"}
            </CardTitle>
          </div>
        </CardHeader>
        {approved && savedText && (
          <CardContent>
            <p className="text-sm text-muted-foreground">{savedText}</p>
          </CardContent>
        )}
      </Card>
    );
  }

  const startEditing = () => {
    setEditValue(currentSummaryText);
    setIsEditing(true);
  };

  const saveEdit = () => {
    setCurrentSummaryText(editValue);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setIsEditing(false);
  };

  const handleAccept = () => {
    setIsSubmitting(true);
    onSubmit({
      approved: true,
      customText: currentSummaryText,
      stepCompleted: "approve_summary",
    });
  };

  const handleSkip = () => {
    setIsSubmitting(true);
    onSubmit({
      approved: false,
      customText: null,
      stepCompleted: "approve_summary",
    });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-5" />
            <CardTitle className="text-base">Professional Summary</CardTitle>
          </div>
          <Badge variant="outline">Step 1 of 3</Badge>
        </div>
        <CardDescription>
          Review the suggested summary tailored for this job
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Match Score & Analysis */}
        <div className="flex flex-col gap-6 rounded-xl border bg-gradient-to-br from-background via-muted/50 to-background p-6 shadow-sm sm:flex-row sm:items-center">
          <div className="flex shrink-0 flex-col items-center gap-2">
            <div className="relative flex size-20 items-center justify-center">
              <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                  className="stroke-muted"
                  strokeWidth="8"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                {/* Progress circle */}
                <circle
                  className="stroke-primary transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  strokeDasharray={`${(summaryData.matchScore || 0) * 2.51} 251`}
                  style={{ opacity: 0.9 }}
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-xl font-bold tracking-tighter text-primary">
                  {summaryData.matchScore || 0}%
                </span>
              </div>
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              Match Score
            </span>
          </div>

          <div className="relative flex-1 space-y-2 border-l px-6 py-1 max-sm:border-l-0 max-sm:border-t max-sm:px-0 max-sm:py-4">
            <h4 className="font-semibold tracking-tight">Match Analysis</h4>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {summaryData.matchAnalysis ||
                "Your tailored summary significantly improves alignment with the job requirements."}
            </p>
          </div>
        </div>

        {/* Comparison Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Current Summary */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Original Summary
            </h4>
            <div className="flex-1 rounded-xl border border-dashed bg-muted/20 p-5">
              <p className="text-sm leading-relaxed text-muted-foreground/80">
                {summaryData.current || (
                  <span className="italic">No summary currently set</span>
                )}
              </p>
            </div>
          </div>

          {/* Suggested Summary */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-sm font-bold text-transparent">
                Optimized Version
              </h4>
              {isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={cancelEdit}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={saveEdit}
                    disabled={isSubmitting}
                  >
                    Save
                  </Button>
                </div>
              )}
            </div>
            {isEditing ? (
              <Textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                className="min-h-[160px] resize-y rounded-xl p-4 text-sm leading-relaxed focus-visible:ring-primary"
                disabled={isSubmitting}
                placeholder="Make your edits here..."
              />
            ) : (
              <div className="group relative flex-1 rounded-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent p-5 transition-colors hover:bg-primary/10">
                <p className="text-sm leading-relaxed text-foreground">
                  {currentSummaryText}
                </p>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute -right-2 -top-2 size-6 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  onClick={startEditing}
                  disabled={isSubmitting}
                  aria-label="Edit summary"
                >
                  <PencilIcon className="size-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Reasoning & Insights */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start">
            <div className="mt-1 rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
              <LightbulbIcon className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-foreground">
                  Why this works better
                </h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {summaryData.reasoning}
                </p>
              </div>

              {summaryData.keywordsIncorporated &&
                summaryData.keywordsIncorporated.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {summaryData.keywordsIncorporated.map((kw, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="border-blue-100 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-900/30 dark:bg-blue-900/20 dark:text-blue-300"
                      >
                        {kw}
                      </Badge>
                    ))}
                  </div>
                )}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          onClick={handleAccept}
          disabled={isSubmitting || isEditing}
          className="w-full sm:flex-1"
          size="lg"
        >
          {isSubmitting ? (
            <Loader2Icon className="mr-2 size-4 animate-spin" />
          ) : (
            <CheckIcon className="mr-2 size-4" />
          )}
          Accept & Continue
        </Button>
        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          <SkipForwardIcon className="mr-2 size-4" />
          Skip for now
        </Button>
      </CardFooter>
    </Card>
  );
}
