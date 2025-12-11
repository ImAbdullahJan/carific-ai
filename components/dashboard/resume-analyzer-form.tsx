"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, FileText, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ResumeUpload } from "@/components/resume-upload";
import { JobDescriptionInput } from "@/components/job-description-input";
import { AnalysisResults } from "@/components/analysis-results";
import {
  ResumeAnalysisSchema,
  type ResumeAnalysisOutput,
} from "@/lib/validations/resume-analysis";

export function ResumeAnalyzerForm() {
  // Form state
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [pageCount, setPageCount] = useState<number | undefined>(undefined);

  // Analysis state
  const [analysisResult, setAnalysisResult] =
    useState<Partial<ResumeAnalysisOutput> | null>(null);
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
    setAnalysisResult(null);

    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText, jobDescription, pageCount }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      setAnalysisResult(data);
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column - Inputs */}
      <div className="grid grid-rows-[auto_1fr_auto] gap-4 h-[calc(100vh-150px)]">
        <Tabs defaultValue="resume" className="w-full contents">
          {/* Tabs header - row 1 (auto) */}
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="resume" className="gap-2">
              <FileText className="h-4 w-4" />
              Resume
              {resumeText && (
                <span className="ml-1 h-2 w-2 rounded-full bg-green-500" />
              )}
            </TabsTrigger>
            <TabsTrigger value="job" className="gap-2">
              <Briefcase className="h-4 w-4" />
              Job Description
              {jobDescription && (
                <span className="ml-1 h-2 w-2 rounded-full bg-green-500" />
              )}
            </TabsTrigger>
          </TabsList>

          {/* Scrollable content - row 2 (1fr) */}
          <ScrollArea className="h-full min-h-[400px]">
            <TabsContent value="resume" className="mt-0">
              <ResumeUpload
                value={resumeText}
                onChange={(text, pages) => {
                  setResumeText(text);
                  setPageCount(pages);
                }}
                disabled={isAnalyzing}
              />
            </TabsContent>

            <TabsContent value="job" className="mt-0">
              <JobDescriptionInput
                value={jobDescription}
                onChange={setJobDescription}
                disabled={isAnalyzing}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Analyze Button - row 3 (auto) */}
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
          analysis={analysisResult}
          isLoading={isAnalyzing}
          error={analysisError}
          onRetry={analyzeResume}
        />
      </div>
    </div>
  );
}
