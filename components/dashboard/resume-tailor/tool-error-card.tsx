"use client";

import { AlertCircleIcon } from "lucide-react";

interface ToolErrorCardProps {
  title: string;
  errorText?: string;
  defaultMessage: string;
}

export function ToolErrorCard({
  title,
  errorText,
  defaultMessage,
}: ToolErrorCardProps) {
  return (
    <div className="flex items-start gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <AlertCircleIcon className="size-5 text-destructive shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-medium text-destructive">{title}</p>
        <p className="text-sm text-muted-foreground mt-1">
          {errorText || defaultMessage}
        </p>
      </div>
    </div>
  );
}
