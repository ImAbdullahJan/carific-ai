"use client";

import { useState } from "react";
import { UIToolInvocation } from "ai";
import { Loader2Icon, BriefcaseIcon } from "lucide-react";

import { collectJobDetailsTool } from "@/ai/tool";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type JobDetailsData = {
  jobTitle: string;
  jobDescription: string;
};

export type JobDetailsCardProps = {
  part: UIToolInvocation<typeof collectJobDetailsTool>;
  onSubmit: (data: JobDetailsData) => void;
};

export function JobDetailsCard({ part, onSubmit }: JobDetailsCardProps) {
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const message =
    part.state === "input-available"
      ? part.input.message
      : "Enter the job details to analyze";
  const submittedData =
    part.state === "output-available" ? part.output : undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim() || !jobDescription.trim()) return;

    setIsSubmitting(true);
    onSubmit({
      jobTitle: jobTitle.trim(),
      jobDescription: jobDescription.trim(),
    });
  };

  if (submittedData) {
    return (
      <Card className="w-full max-w-lg border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="size-5 text-green-600 dark:text-green-400" />
            <CardTitle className="text-base text-green-700 dark:text-green-300">
              Job Details Submitted
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div>
            <span className="font-medium text-muted-foreground">
              Job Title:
            </span>{" "}
            <span className="text-foreground">{submittedData.jobTitle}</span>
          </div>
          <div>
            <span className="font-medium text-muted-foreground">
              Description:
            </span>
            <p className="mt-1 line-clamp-3 text-foreground">
              {submittedData.jobDescription}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BriefcaseIcon className="size-5 text-primary" />
          <CardTitle className="text-base">Job Details</CardTitle>
        </div>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              placeholder="e.g., Senior Software Engineer"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={isSubmitting}
              className="min-h-[150px] resize-y"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={
              isSubmitting || !jobTitle.trim() || !jobDescription.trim()
            }
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="mr-2 size-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Job Match"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
