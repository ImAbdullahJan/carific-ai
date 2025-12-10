"use client";

import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PriorityActionsProps {
  actions?: string[];
}

export function PriorityActions({ actions }: PriorityActionsProps) {
  if (!actions || actions.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Top Priority Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ol className="space-y-2">
          {actions.map((action, index) => (
            <li key={index} className="flex gap-3 text-sm">
              <span className="shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                {index + 1}
              </span>
              <span className="pt-0.5">{action}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
