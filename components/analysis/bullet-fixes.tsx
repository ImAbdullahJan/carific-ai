"use client";

import { useState } from "react";
import {
  Pencil,
  Copy,
  Check,
  MapPin,
  Lightbulb,
  ArrowDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import type { BulletFix } from "@/lib/validations/resume-analysis";
import { cn } from "@/lib/utils";

interface BulletFixesProps {
  fixes?: BulletFix[];
}

export function BulletFixes({ fixes }: BulletFixesProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!fixes || fixes.length === 0) return null;

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      toast.success("Copied! Paste it into your resume.");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Pencil className="h-5 w-5 text-primary" />
          Bullet Point Fixes
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Specific improvements to your resume content — copy the improved
          version directly
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {fixes.map((fix, index) => (
            <div key={index} className="rounded-lg border overflow-hidden">
              {/* Header with location and impact */}
              <div className="flex items-center justify-between gap-2 px-4 py-2 bg-muted/50 border-b">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{fix.location}</span>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    fix.impact === "High"
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                  )}
                >
                  {fix.impact} Impact
                </Badge>
              </div>

              {/* Before/After comparison */}
              <div className="p-4 space-y-3">
                {/* Original */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Before
                    </span>
                  </div>
                  <p className="text-sm p-3 rounded-md bg-red-500/5 border border-red-500/10 text-muted-foreground line-through decoration-red-500/30">
                    {fix.original}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex justify-center align-bottom mb-0">
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                </div>

                {/* Improved */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      After
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => copyToClipboard(fix.improved, index)}
                    >
                      {copiedIndex === index ? (
                        <>
                          <Check className="h-3 w-3 mr-1 text-green-500" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-sm p-3 rounded-md bg-green-500/5 border border-green-500/20 font-medium">
                    {fix.improved}
                  </p>
                </div>

                {/* Reason */}
                <div className="flex gap-2 pt-2 border-t">
                  <Lightbulb className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Why: </span>
                    {fix.reason}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded-lg">
          💡 <span className="font-medium">Tip:</span> Adjust the metrics and
          details to match your actual experience. The AI suggests realistic
          improvements, but you know your work best.
        </p>
      </CardContent>
    </Card>
  );
}
