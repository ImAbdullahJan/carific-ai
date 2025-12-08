"use client";

import { Sparkles, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnalysisResultsProps {
  content: string;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

export function AnalysisResults({
  content,
  isLoading,
  error,
  onRetry,
}: AnalysisResultsProps) {
  // Empty state
  if (!content && !isLoading && !error) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Ready to Analyze</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Upload your resume and paste a job description, then click
            &quot;Analyze Resume&quot; to get personalized feedback.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="h-full border-destructive">
        <CardContent className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
          <div className="rounded-full bg-destructive/10 p-4 mb-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Analysis Failed</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-4">{error}</p>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Analysis Results</CardTitle>
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-auto" />
          )}
        </div>
        <CardDescription>
          {isLoading
            ? "Analyzing your resume..."
            : "AI-powered feedback for your resume"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[calc(100vh-350px)] min-h-[400px] pr-4">
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MarkdownContent content={content} />
          </div>
          {isLoading && (
            <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1" />
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// Simple markdown renderer for the analysis content
function MarkdownContent({ content }: { content: string }) {
  const lines = content.split("\n");

  return (
    <div className="space-y-2">
      {lines.map((line, index) => {
        // Headers
        if (line.startsWith("## ")) {
          return (
            <h2
              key={index}
              className="text-lg font-semibold mt-6 mb-3 flex items-center gap-2 text-primary"
            >
              {line.replace("## ", "")}
            </h2>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <h3 key={index} className="text-base font-medium mt-4 mb-2">
              {line.replace("### ", "")}
            </h3>
          );
        }

        // Bullet points
        if (line.startsWith("- ") || line.startsWith("* ")) {
          return (
            <div key={index} className="flex gap-2 ml-2">
              <span className="text-primary mt-1.5">•</span>
              <span className="flex-1">{line.replace(/^[-*] /, "")}</span>
            </div>
          );
        }

        // Numbered lists
        if (/^\d+\. /.test(line)) {
          const match = line.match(/^(\d+)\. (.*)$/);
          if (match) {
            return (
              <div key={index} className="flex gap-2 ml-2">
                <span className="text-primary font-medium min-w-6">
                  {match[1]}.
                </span>
                <span className="flex-1">{match[2]}</span>
              </div>
            );
          }
        }

        // Bold text handling
        if (line.includes("**")) {
          const parts = line.split(/\*\*(.*?)\*\*/g);
          return (
            <p key={index} className="leading-relaxed">
              {parts.map((part, i) =>
                i % 2 === 1 ? (
                  <strong key={i} className="font-semibold">
                    {part}
                  </strong>
                ) : (
                  part
                )
              )}
            </p>
          );
        }

        // Empty lines
        if (!line.trim()) {
          return <div key={index} className="h-2" />;
        }

        // Regular paragraphs
        return (
          <p key={index} className="leading-relaxed">
            {line}
          </p>
        );
      })}
    </div>
  );
}
