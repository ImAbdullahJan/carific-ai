"use client";

import { RefreshCwIcon, WifiOffIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface RetryCardProps {
  /** The message that failed to get a response */
  failedMessage?: string;
  /** Callback to retry sending the message */
  onRetry: () => void;
  /** Whether a retry is currently in progress */
  isRetrying?: boolean;
}

export function RetryCard({
  failedMessage,
  onRetry,
  isRetrying = false,
}: RetryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="border-amber-500/30 bg-linear-to-br from-amber-500/5 to-orange-500/10 mx-4 mt-4 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="rounded-full bg-amber-500/10 p-3 shrink-0 relative">
            <WifiOffIcon
              className={`h-6 w-6 text-amber-600 transition-opacity duration-300 ${
                isHovered ? "opacity-0" : "opacity-100"
              }`}
            />
            <RefreshCwIcon
              className={`h-6 w-6 text-amber-600 absolute inset-0 m-auto transition-all duration-300 ${
                isHovered ? "opacity-100 rotate-180" : "opacity-0 rotate-0"
              } ${isRetrying ? "animate-spin" : ""}`}
            />
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg text-amber-800 dark:text-amber-200">
                  Connection Interrupted
                </h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                It looks like the connection was lost before I could respond.
                This can happen due to network issues or if the page was closed
                during processing.
              </p>
              {failedMessage && (
                <div className="mt-3 p-3 bg-muted/50 rounded-lg border border-muted">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">
                    Your message:
                  </p>
                  <p className="text-sm text-foreground/80 italic">
                    &ldquo;{failedMessage.slice(0, 100)}
                    {failedMessage.length > 100 ? "..." : ""}&rdquo;
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={onRetry}
                disabled={isRetrying}
                className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isRetrying ? (
                  <>
                    <RefreshCwIcon className="h-4 w-4 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <RefreshCwIcon className="h-4 w-4" />
                    Try Again
                  </>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                Don&apos;t worry, your progress is saved
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
