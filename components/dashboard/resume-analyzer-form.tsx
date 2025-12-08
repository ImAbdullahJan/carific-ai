"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ResumeUpload } from "@/components/resume-upload";
import { JobDescriptionInput } from "@/components/job-description-input";
import { AnalysisResults } from "@/components/analysis-results";
import { ResumeAnalysisSchema } from "@/lib/validations/resume-analysis";

export function ResumeAnalyzerForm() {
  // Form state
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  // Analysis state
  const [analysisResult, setAnalysisResult] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const analyzeResume = async () => {
    const validation = ResumeAnalysisSchema.safeParse({
      resumeText,
      jobDescription,
    });

    if (!validation.success) {
      toast.error(validation.error.issues[0].message);
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult("");

    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to analyze resume");
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("No response stream available");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setAnalysisResult((prev) => prev + chunk);
      }

      toast.success("Analysis complete!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      setAnalysisError(message);
      toast.error(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const canAnalyze =
    ResumeAnalysisSchema.safeParse({ resumeText, jobDescription }).success &&
    !isAnalyzing;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column - Inputs */}
      <div className="space-y-6">
        {/* Resume Upload Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Your Resume</CardTitle>
            </div>
            <CardDescription>
              Upload a PDF or paste your resume text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResumeUpload
              value={resumeText}
              onChange={setResumeText}
              disabled={isAnalyzing}
            />
          </CardContent>
        </Card>

        {/* Job Description Section */}
        <JobDescriptionInput
          value={jobDescription}
          onChange={setJobDescription}
          disabled={isAnalyzing}
        />

        {/* Analyze Button */}
        <Button
          size="lg"
          className="w-full"
          onClick={analyzeResume}
          disabled={!canAnalyze}
        >
          {isAnalyzing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Analyze Resume
            </>
          )}
        </Button>
      </div>

      {/* Right Column - Results */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <AnalysisResults
          content={analysisResult}
          isLoading={isAnalyzing}
          error={analysisError}
          onRetry={analyzeResume}
        />
      </div>
    </div>
  );
}
