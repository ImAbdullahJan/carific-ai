"use client";

import { Sparkles, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ScoreCard,
  MissingKeywords,
  BulletFixes,
  PriorityActions,
  SectionFeedbackList,
  LengthAssessment,
} from "@/components/analysis";
import type { ResumeAnalysisOutput } from "@/lib/validations/resume-analysis";

interface AnalysisResultsProps {
  analysis: Partial<ResumeAnalysisOutput> | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function AnalysisResults({
  analysis,
  isLoading,
  error,
  onRetry,
}: AnalysisResultsProps) {
  // Empty state
  if (!analysis && !isLoading && !error) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Upload your resume and paste a job description, then click
            &quot;Analyze Resume&quot; to get personalized feedback.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="h-full border-destructive">
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Analysis Failed</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">{error}</p>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Loading state with no data yet
  if (isLoading && !analysis) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analyzing Your Resume</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Finding specific improvements for your resume...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)] min-h-[500px]">
      <div className="space-y-4 pr-4">
        {/* Header with loading indicator */}
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Your Action Plan</h2>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
          )}
        </div>

        {/* Priority Actions - What to do first */}
        <PriorityActions actions={analysis?.priorityActions} />

        {/* Bullet Fixes - The core value: specific before/after improvements */}
        <BulletFixes fixes={analysis?.bulletFixes} />

        {/* Missing Keywords - What to add */}
        <MissingKeywords keywords={analysis?.missingKeywords} />

        {/* Section Completeness - Only shows if issues exist */}
        <SectionFeedbackList sections={analysis?.sectionFeedback} />

        {/* Length Assessment - Only shows if not appropriate */}
        <LengthAssessment assessment={analysis?.lengthAssessment} />

        {/* Score Card - De-emphasized, at the bottom */}
        <ScoreCard
          score={analysis?.score}
          label={analysis?.scoreLabel}
          summary={analysis?.scoreSummary}
        />
      </div>
    </ScrollArea>
  );
}
