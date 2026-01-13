"use client";

import { ArrowRight, Sparkles, MessageSquare, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DBPlanStep } from "@/lib/db/tailoring-chat";

interface StepGuideProps {
  /** Plan steps from database */
  planSteps: DBPlanStep[];
  /** Whether there are any messages yet */
  hasMessages: boolean;
  /** Whether the agent is currently streaming */
  isStreaming: boolean;
  /** Callback to send a message to start the process */
  onStart: () => void;
  /** Callback to continue to the next step */
  onContinue: () => void;
}

export function StepGuide({
  planSteps,
  hasMessages,
  isStreaming,
  onStart,
  onContinue,
}: StepGuideProps) {
  // Don't show anything while streaming
  if (isStreaming) {
    return null;
  }

  // First-time user - show welcome message
  if (!hasMessages) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 mx-4 mt-4">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-primary/10 p-3 shrink-0">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">
                  Ready to tailor your resume?
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  I&apos;ll guide you through optimizing your resume for a
                  specific job. We&apos;ll work together to tailor your summary,
                  experience bullets, and skills to match the job description.
                </p>
              </div>
              <Button onClick={onStart} size="lg" className="gap-2">
                <Sparkles className="h-4 w-4" />
                Start Tailoring
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no plan steps yet, don't show guide
  if (planSteps.length === 0) {
    return null;
  }

  // Calculate progress from DB steps
  const completedCount = planSteps.filter(
    (s) => s.status === "completed" || s.status === "skipped"
  ).length;
  const totalCount = planSteps.length;

  // Find the next pending step (not completed or skipped)
  const nextStep = planSteps.find(
    (step) => step.status === "pending" || step.status === "in_progress"
  );

  // All steps completed or skipped
  if (!nextStep) {
    return (
      <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-green-500/10 mx-4 mt-4">
        <CardContent>
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-green-500/10 p-3 shrink-0">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg mb-2">
                All steps completed! 🎉
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your resume has been successfully tailored. Review the changes
                in the preview and download when ready.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if this is an approval step that needs user action
  const isApprovalStep = nextStep.type.startsWith("approve_");
  const needsUserAction = isApprovalStep;

  // Show next step guide
  return (
    <Card
      className={cn(
        "border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-blue-500/10 mx-4 mt-4",
        needsUserAction &&
          "border-amber-500/20 from-amber-500/5 to-amber-500/10"
      )}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "rounded-full bg-blue-500/10 p-3 shrink-0",
              needsUserAction && "bg-amber-500/10"
            )}
          >
            {needsUserAction ? (
              <MessageSquare className="h-6 w-6 text-amber-600" />
            ) : (
              <ArrowRight className="h-6 w-6 text-blue-600" />
            )}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">Next Step</h3>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                  {completedCount} of {totalCount} completed
                </span>
              </div>
              <p className="font-medium text-sm mb-1">{nextStep.label}</p>
              {nextStep.description && (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {nextStep.description}
                </p>
              )}
            </div>
            {needsUserAction ? (
              <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">
                ⏸️ Waiting for your approval above to continue
              </p>
            ) : (
              <Button onClick={onContinue} size="lg" className="gap-2">
                <ArrowRight className="h-4 w-4" />
                Continue to Next Step
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
