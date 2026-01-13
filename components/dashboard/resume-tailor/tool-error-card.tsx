"use client";

import { AlertCircleIcon, RefreshCwIcon, SkipForwardIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ToolErrorCardProps {
  title: string;
  errorText?: string;
  defaultMessage: string;
  onRetry: () => void;
  onSkip: () => void;
}

export function ToolErrorCard({
  title,
  errorText,
  defaultMessage,
  onRetry,
  onSkip,
}: ToolErrorCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <div className="flex items-start gap-2">
        <AlertCircleIcon className="size-5 text-destructive shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-medium text-destructive">{title}</p>
          <p className="text-sm text-muted-foreground mt-1">
            {errorText || defaultMessage}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 ml-7">
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          className="gap-1.5"
        >
          <RefreshCwIcon className="size-3.5" />
          Retry
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkip}
          className="gap-1.5 text-muted-foreground"
        >
          <SkipForwardIcon className="size-3.5" />
          Skip
        </Button>
      </div>
    </div>
  );
}
