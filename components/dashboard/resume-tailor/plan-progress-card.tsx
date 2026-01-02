"use client";

import { CheckCircle2Icon, CircleIcon, Loader2Icon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TailoringPlan, PlanStepType } from "@/ai/tool/resume-tailor";

interface PlanProgressCardProps {
  plan: TailoringPlan;
  completedSteps: Set<PlanStepType>;
  currentStep?: PlanStepType;
}

export function PlanProgressCard({
  plan,
  completedSteps,
  currentStep,
}: PlanProgressCardProps) {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Tailoring Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {plan.steps.map((step, index) => {
            const isCompleted = completedSteps.has(step.type);
            const isCurrent = step.type === currentStep;

            return (
              <div key={step.id} className="flex items-start gap-3">
                {/* Step indicator */}
                <div className="flex flex-col items-center">
                  {isCompleted ? (
                    <CheckCircle2Icon className="size-5 text-green-600" />
                  ) : isCurrent ? (
                    <Loader2Icon className="size-5 animate-spin text-primary" />
                  ) : (
                    <CircleIcon className="size-5 text-muted-foreground/40" />
                  )}
                  {index < plan.steps.length - 1 && (
                    <div
                      className={cn(
                        "mt-1 h-6 w-0.5",
                        isCompleted ? "bg-green-600" : "bg-muted-foreground/20"
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
                      isCurrent && "text-primary",
                      !isCompleted && !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {step.label}
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
