"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ScoreCardProps {
  score?: number;
  label?: string;
  summary?: string;
}

export function ScoreCard({ score, label, summary }: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score < 40) return "text-red-500";
    if (score < 60) return "text-yellow-500";
    if (score < 75) return "text-blue-500";
    return "text-green-500";
  };

  const getScoreRingColor = (score: number) => {
    if (score < 40) return "stroke-red-500";
    if (score < 60) return "stroke-yellow-500";
    if (score < 75) return "stroke-blue-500";
    return "stroke-green-500";
  };

  const getLabelVariant = (label: string) => {
    switch (label) {
      case "Poor":
        return "destructive";
      case "Fair":
        return "secondary";
      case "Good":
        return "default";
      case "Strong":
      case "Excellent":
        return "default";
      default:
        return "secondary";
    }
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset =
    score !== undefined
      ? circumference - (score / 100) * circumference
      : circumference;

  return (
    <Card>
      <CardContent>
        <div className="flex items-center gap-6">
          {/* Circular Progress */}
          <div className="relative w-28 h-28 shrink-0">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-muted/20"
              />
              <circle
                cx="56"
                cy="56"
                r="45"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                className={cn(
                  "transition-all duration-500",
                  score !== undefined
                    ? getScoreRingColor(score)
                    : "stroke-muted"
                )}
                style={{
                  strokeDasharray: circumference,
                  strokeDashoffset: strokeDashoffset,
                }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span
                className={cn(
                  "text-3xl font-bold",
                  score !== undefined ? getScoreColor(score) : "text-muted"
                )}
              >
                {score !== undefined ? score : "—"}
              </span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>

          {/* Score Details */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Match Score</h3>
              {label && (
                <Badge
                  variant={
                    getLabelVariant(label) as
                      | "default"
                      | "secondary"
                      | "destructive"
                  }
                >
                  {label}
                </Badge>
              )}
            </div>
            {summary ? (
              <p className="text-sm text-muted-foreground">{summary}</p>
            ) : (
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
