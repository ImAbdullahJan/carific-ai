"use client";

import {
  CheckCircle2Icon,
  CircleIcon,
  Loader2Icon,
  SkipForwardIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { DBPlanStep } from "@/lib/db/tailoring-chat";

interface PlanProgressCardProps {
  planSteps: DBPlanStep[];
}

export function PlanProgressCard({ planSteps }: PlanProgressCardProps) {
  if (planSteps.length === 0) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Tailoring Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {planSteps.map((step, index) => {
            const isCompleted = step.status === "completed";
            const isSkipped = step.status === "skipped";
            const isCurrent = step.status === "in_progress";

            return (
              <div key={step.id} className="flex items-start gap-3">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  {isCompleted ? (
                    <CheckCircle2Icon className="size-5 text-green-600" />
                  ) : isSkipped ? (
                    <SkipForwardIcon className="size-5 text-muted-foreground" />
                  ) : isCurrent ? (
                    <Loader2Icon className="size-5 animate-spin text-primary" />
                  ) : (
                    <CircleIcon className="size-5 text-muted-foreground/40" />
                  )}
                  {index < planSteps.length - 1 && (
                    <div
                      className={cn(
                        "mt-1 h-6 w-0.5",
                        isCompleted
                          ? "bg-green-600"
                          : isSkipped
                            ? "bg-muted-foreground/40"
                            : "bg-muted-foreground/20"
                      )}
                    />
                  )}
                </div>

                {/* Step content */}
                <div className="flex-1 pb-2">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCompleted && "text-green-600",
                      isSkipped && "text-muted-foreground line-through",
                      isCurrent && "text-primary",
                      !isCompleted &&
                        !isSkipped &&
                        !isCurrent &&
                        "text-muted-foreground"
                    )}
                  >
                    {step.label}
                    {isSkipped && (
                      <span className="ml-2 text-xs font-normal">
                        (skipped)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
