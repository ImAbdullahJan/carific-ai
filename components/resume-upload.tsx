"use client";

import { useState } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { extractTextFromPDF } from "@/lib/pdf-parser";

interface ResumeUploadProps {
  value: string;
  onChange: (text: string, pageCount?: number) => void;
  disabled?: boolean;
}

export function ResumeUpload({ value, onChange, disabled }: ResumeUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    if (disabled || isProcessing) return;
    setError(null);
    setIsProcessing(true);

    try {
      let text = "";
      let pageCount: number | undefined;

      if (file.type === "application/pdf") {
        const result = await extractTextFromPDF(file);
        text = result.text;
        pageCount = result.pageCount;
      } else if (
        file.type === "text/plain" ||
        file.name.endsWith(".txt") ||
        file.name.endsWith(".md")
      ) {
        text = await file.text();
      } else {
        throw new Error(
          "Unsupported file type. Please upload a PDF or text file."
        );
      }

      if (!text.trim()) {
        throw new Error(
          "Could not extract text from the file. Please try pasting your resume directly."
        );
      }

      setFileName(file.name);
      onChange(text, pageCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process file");
      setFileName(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (disabled || isProcessing) return;

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled && !isProcessing) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !disabled && !isProcessing) {
      processFile(file);
    }
  };

  const handleClear = () => {
    onChange("", undefined);
    setFileName(null);
    setError(null);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <Card
        className={cn(
          "border-2 border-dashed transition-colors cursor-pointer",
          isDragging && "border-primary bg-primary/5",
          (disabled || isProcessing) && "opacity-50 cursor-not-allowed",
          error && "border-destructive"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <CardContent className="relative flex flex-col items-center justify-center py-8">
          {isProcessing ? (
            <>
              <Loader2 className="h-10 w-10 text-muted-foreground animate-spin mb-3" />
              <p className="text-sm text-muted-foreground">
                Processing file...
              </p>
            </>
          ) : fileName ? (
            <>
              <FileText className="h-10 w-10 text-primary mb-3" />
              <p className="text-sm font-medium">{fileName}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Resume loaded successfully
              </p>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={handleClear}
                disabled={disabled}
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </>
          ) : (
            <>
              <Upload className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm font-medium">
                Drop your resume here or click to upload
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Supports PDF and text files
              </p>
              <input
                type="file"
                accept=".pdf,.txt,.md,application/pdf,text/plain"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileSelect}
                disabled={disabled || isProcessing}
              />
            </>
          )}
        </CardContent>
      </Card>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* Manual Text Input */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Or paste your resume text directly:
        </p>
        <Textarea
          placeholder="Paste your resume content here..."
          value={value}
          onChange={(e) => {
            onChange(e.target.value, undefined);
            if (e.target.value && fileName) {
              setFileName(null);
            }
          }}
          disabled={disabled}
          className="min-h-[200px] font-mono text-sm"
        />
        {value && (
          <p className="text-xs text-muted-foreground text-right">
            {value.length.toLocaleString()} characters
          </p>
        )}
      </div>
    </div>
  );
}
