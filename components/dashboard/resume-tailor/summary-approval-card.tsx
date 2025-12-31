"use client";

import { useState } from "react";
import { UIToolInvocation } from "ai";
import {
  CheckIcon,
  PencilIcon,
  SkipForwardIcon,
  SparklesIcon,
  Loader2Icon,
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
  summaryData?: {
    current: string | null;
    suggested: string;
    reasoning: string;
    keywordsIncorporated: string[];
  };
  onSubmit: (data: SummaryApproval) => void;
};

export function SummaryApprovalCard({
  part,
  summaryData,
  onSubmit,
}: SummaryApprovalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [customText, setCustomText] = useState(summaryData?.suggested || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (part.state === "output-available") {
    const { approved, customText: savedText } = part.output;
    return (
      <Card
        className={cn(
          "w-full max-w-2xl border-2",
          approved
            ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
            : "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {approved ? (
              <CheckIcon className="size-5 text-green-600 dark:text-green-400" />
            ) : (
              <SkipForwardIcon className="size-5 text-yellow-600 dark:text-yellow-400" />
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

  if (!summaryData) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        <span>Preparing summary suggestions...</span>
      </div>
    );
  }

  const handleAccept = () => {
    setIsSubmitting(true);
    onSubmit({
      approved: true,
      customText: isEditing ? customText : summaryData.suggested,
    });
  };

  const handleSkip = () => {
    setIsSubmitting(true);
    onSubmit({ approved: false });
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SparklesIcon className="size-5 text-purple-500" />
            <CardTitle className="text-base">Professional Summary</CardTitle>
          </div>
          <Badge variant="outline">Step 1 of 3</Badge>
        </div>
        <CardDescription>
          Review the suggested summary tailored for this job
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Summary */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Current</h4>
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-sm">
              {summaryData.current || (
                <span className="italic text-muted-foreground">
                  No summary currently set
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Suggested Summary */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-green-600 dark:text-green-400">
              Suggested
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditing(!isEditing);
                if (!isEditing) {
                  setCustomText(summaryData.suggested);
                }
              }}
              disabled={isSubmitting}
            >
              <PencilIcon className="mr-1 size-3" />
              {isEditing ? "Cancel Edit" : "Edit"}
            </Button>
          </div>
          {isEditing ? (
            <Textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="min-h-[100px] resize-y"
              disabled={isSubmitting}
            />
          ) : (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-900 dark:bg-green-950/30">
              <p className="text-sm">{summaryData.suggested}</p>
            </div>
          )}
        </div>

        {/* Reasoning */}
        <div className="rounded-lg bg-muted/50 p-3">
          <h4 className="mb-1 text-xs font-medium text-muted-foreground">
            Why this works better
          </h4>
          <p className="text-sm">{summaryData.reasoning}</p>
        </div>

        {/* Keywords */}
        {summaryData.keywordsIncorporated.length > 0 && (
          <div>
            <h4 className="mb-2 text-xs font-medium text-muted-foreground">
              Keywords incorporated
            </h4>
            <div className="flex flex-wrap gap-1">
              {summaryData.keywordsIncorporated.map((keyword, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          onClick={handleAccept}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? (
            <Loader2Icon className="mr-2 size-4 animate-spin" />
          ) : (
            <CheckIcon className="mr-2 size-4" />
          )}
          {isEditing ? "Accept Edited" : "Accept"}
        </Button>
        <Button variant="outline" onClick={handleSkip} disabled={isSubmitting}>
          <SkipForwardIcon className="mr-2 size-4" />
          Skip
        </Button>
      </CardFooter>
    </Card>
  );
}
