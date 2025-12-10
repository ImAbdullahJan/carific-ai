"use client";

import { FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LengthAssessmentProps {
  assessment?: {
    currentLength: "Too Short" | "Appropriate" | "Too Long";
    recommendation: string;
  };
}

export function LengthAssessment({ assessment }: LengthAssessmentProps) {
  if (!assessment) return null;

  // Don't show if length is appropriate
  if (assessment.currentLength === "Appropriate") {
    return null;
  }

  const getStyles = (length: string) => {
    switch (length) {
      case "Appropriate":
        return {
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
          badge: "bg-green-500/10 text-green-600 border-green-500/20",
          border: "border-green-500/20",
        };
      case "Too Short":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
          badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          border: "border-amber-500/20",
        };
      case "Too Long":
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
          badge: "bg-amber-500/10 text-amber-600 border-amber-500/20",
          border: "border-amber-500/20",
        };
      default:
        return {
          icon: <FileText className="h-5 w-5 text-muted-foreground" />,
          badge: "bg-muted text-muted-foreground",
          border: "",
        };
    }
  };

  const styles = getStyles(assessment.currentLength);

  return (
    <Card className={cn(styles.border)}>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Resume Length
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-start gap-3">
          {styles.icon}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={cn("text-xs", styles.badge)}>
                {assessment.currentLength}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {assessment.recommendation}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
