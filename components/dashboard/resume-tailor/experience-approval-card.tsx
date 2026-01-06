"use client";

import { useState } from "react";
import { UIToolInvocation } from "ai";
import {
  CheckIcon,
  PencilIcon,
  SkipForwardIcon,
  Loader2Icon,
  LightbulbIcon,
  BriefcaseIcon,
  SparklesIcon,
  XIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowRightIcon,
} from "lucide-react";

import { approveExperienceEntryTool } from "@/ai/tool/resume-tailor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ExperienceApproval } from "@/ai/tool/resume-tailor";

export type ExperienceApprovalCardProps = {
  part: UIToolInvocation<typeof approveExperienceEntryTool>;
  experienceData?: {
    experienceId: string;
    originalRole: string;
    originalCompany: string;
    originalBullets: string[];
    relevanceScore: number;
    suggestedBullets: string[];
    reasoning: string;
    improvements: string[];
  };
  onSubmit: (data: ExperienceApproval) => void;
};

export function ExperienceApprovalCard({
  part,
  experienceData,
  onSubmit,
}: ExperienceApprovalCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [currentBullets, setCurrentBullets] = useState<string[]>(
    experienceData?.suggestedBullets || []
  );
  const [editedBullets, setEditedBullets] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already approved/skipped
  if (part.state === "output-available") {
    const { approved } = part.output;
    return (
      <Card className="w-full max-w-2xl border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            {approved ? (
              <CheckIcon className="size-5 text-green-600" />
            ) : (
              <SkipForwardIcon className="size-5 text-muted-foreground" />
            )}
            <CardTitle className="text-base">
              {approved ? "Experience Updated" : "Experience Skipped"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {approved
              ? `Successfully updated ${experienceData?.originalRole} at ${experienceData?.originalCompany}`
              : `Skipped changes for ${experienceData?.originalRole}`}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!experienceData) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2Icon className="size-4 animate-spin" />
        <span>Optimizing experience bullets...</span>
      </div>
    );
  }

  const startEditing = () => {
    setEditedBullets([...currentBullets]);
    setIsEditing(true);
  };

  const saveEdit = () => {
    // Filter out empty bullets
    const cleanedBullets = editedBullets
      .map((b) => b.trim())
      .filter((b) => b.length > 0);
    setCurrentBullets(cleanedBullets);
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditedBullets([]);
    setIsEditing(false);
  };

  const updateBullet = (index: number, value: string) => {
    const updated = [...editedBullets];
    updated[index] = value;
    setEditedBullets(updated);
  };

  const removeBullet = (index: number) => {
    setEditedBullets(editedBullets.filter((_, i) => i !== index));
  };

  const handleAccept = () => {
    setIsSubmitting(true);
    onSubmit({
      experienceId: experienceData.experienceId,
      approved: true,
      finalBullets: currentBullets,
      stepCompleted: "approve_experience",
    });
  };

  const handleSkip = () => {
    setIsSubmitting(true);
    onSubmit({
      experienceId: experienceData.experienceId,
      approved: false,
      stepCompleted: "approve_experience",
    });
  };

  const getRelevanceLabel = (score: number) => {
    if (score >= 90)
      return { text: "Highly relevant", color: "text-green-600" };
    if (score >= 70)
      return { text: "Moderately relevant", color: "text-blue-600" };
    if (score >= 50)
      return { text: "Some relevance", color: "text-orange-600" };
    return { text: "Limited relevance", color: "text-red-600" };
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BriefcaseIcon className="size-5" />
            <CardTitle className="text-base">
              {experienceData.originalRole}
            </CardTitle>
          </div>
          <Badge variant="outline">{experienceData.originalCompany}</Badge>
        </div>
        <CardDescription>Review tailored bullets for this role</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Relevance Score */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-start gap-4">
            <div className="flex shrink-0 flex-col items-center gap-1">
              <div className="relative flex size-16 items-center justify-center rounded-full border-4 border-primary/20 bg-background">
                <span className="text-xl font-bold">
                  {experienceData.relevanceScore}%
                </span>
              </div>
              <p
                className={`text-xs font-medium ${getRelevanceLabel(experienceData.relevanceScore).color}`}
              >
                {getRelevanceLabel(experienceData.relevanceScore).text}
              </p>
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="font-semibold">Key Improvements</h4>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {experienceData.improvements.map((imp, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span className="flex-1">{imp}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Before/After Comparison Toggle */}
        {experienceData.originalBullets.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOriginal(!showOriginal)}
            className="w-full"
          >
            {showOriginal ? (
              <>
                <ChevronUpIcon className="mr-2 size-4" />
                Hide Original Bullets
              </>
            ) : (
              <>
                <ChevronDownIcon className="mr-2 size-4" />
                Compare with Original Bullets
              </>
            )}
          </Button>
        )}

        {/* Original Bullets (Collapsible) */}
        {showOriginal && experienceData.originalBullets.length > 0 && (
          <div className="space-y-2 rounded-lg border border-muted bg-muted/30 p-4">
            <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <BriefcaseIcon className="size-4" />
              Original Bullets ({experienceData.originalBullets.length})
            </h4>
            <div className="space-y-2">
              {experienceData.originalBullets.map((bullet, i) => (
                <div
                  key={i}
                  className="rounded-md bg-background p-3 text-sm leading-relaxed text-muted-foreground"
                >
                  <div className="flex gap-2">
                    <span className="mt-0.5">•</span>
                    <span className="flex-1">{bullet}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center pt-2">
              <ArrowRightIcon className="size-5 text-primary" />
            </div>
          </div>
        )}

        {/* Optimized Bullets Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="flex items-center gap-2 text-sm font-medium text-primary">
              <SparklesIcon className="size-4" />
              Optimized Bullets (
              {isEditing ? editedBullets.length : currentBullets.length})
            </h4>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={cancelEdit}
                  disabled={isSubmitting}
                  className="h-7 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={saveEdit}
                  disabled={isSubmitting}
                  className="h-7 text-xs"
                >
                  Save
                </Button>
              </div>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={startEditing}
                disabled={isSubmitting}
                className="h-7 text-xs"
              >
                <PencilIcon className="mr-1 size-3" />
                Edit
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-2">
              {editedBullets.map((bullet, i) => (
                <div key={i} className="flex gap-2">
                  <div className="flex-1">
                    <Textarea
                      value={bullet}
                      onChange={(e) => updateBullet(i, e.target.value)}
                      className="min-h-[60px] resize-none text-sm"
                      placeholder={`Bullet point ${i + 1}...`}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBullet(i)}
                    disabled={isSubmitting || editedBullets.length === 1}
                    className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <XIcon className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {currentBullets.map((bullet, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-card p-3 text-sm leading-relaxed"
                >
                  <div className="flex gap-2">
                    <span className="mt-0.5 text-primary">•</span>
                    <span className="flex-1">
                      {bullet
                        .split(/(\*\*.*?\*\*)/)
                        .map((part, index) =>
                          part.startsWith("**") && part.endsWith("**") ? (
                            <strong key={index}>{part.slice(2, -2)}</strong>
                          ) : (
                            part
                          )
                        )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reasoning */}
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex gap-3">
            <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Why these changes?
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {experienceData.reasoning}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          onClick={handleAccept}
          disabled={isSubmitting || isEditing}
          className="w-full sm:flex-1"
          size="lg"
        >
          {isSubmitting ? (
            <Loader2Icon className="mr-2 size-4 animate-spin" />
          ) : (
            <CheckIcon className="mr-2 size-4" />
          )}
          Accept Changes
        </Button>
        <Button
          variant="outline"
          onClick={handleSkip}
          disabled={isSubmitting}
          className="w-full sm:w-auto"
        >
          <SkipForwardIcon className="mr-2 size-4" />
          Skip this role
        </Button>
      </CardFooter>
    </Card>
  );
}
