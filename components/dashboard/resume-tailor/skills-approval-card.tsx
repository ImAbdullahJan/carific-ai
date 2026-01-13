"use client";

import { useState } from "react";
import { UIToolInvocation } from "ai";
import {
  CheckIcon,
  Loader2Icon,
  LightbulbIcon,
  LayoutGridIcon,
  SkipForwardIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "lucide-react";

import { approveSkillsTool } from "@/ai/tool/resume-tailor";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SkillsApproval } from "@/ai/tool/resume-tailor";

export type SkillsApprovalCardProps = {
  part: UIToolInvocation<typeof approveSkillsTool>;
  skillsData: {
    originalSkills: { name: string; category: string | null }[];
    suggestedSkills: {
      name: string;
      category: string;
      relevance: "high" | "medium" | "low";
      isNew: boolean;
    }[];
    reasoning: string;
    improvements: string[];
    keywordsMatched: string[];
  };
  onSubmit: (data: SkillsApproval) => void;
};

export function SkillsApprovalCard({
  part,
  skillsData,
  onSubmit,
}: SkillsApprovalCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

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
              {approved ? "Skills Optimized" : "Skills Skipped"}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {approved
              ? "Your skills have been reorganized and tailored for this role."
              : "Skipped skill optimization."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleAccept = () => {
    setIsSubmitting(true);
    onSubmit({
      approved: true,
      finalSkills: skillsData.suggestedSkills.map((s) => ({
        name: s.name,
        category: s.category,
      })),
      stepCompleted: "approve_skills",
    });
  };

  const handleSkip = () => {
    setIsSubmitting(true);
    onSubmit({
      approved: false,
      stepCompleted: "approve_skills",
    });
  };

  // Group skills by category for display
  const groupedSkills = skillsData.suggestedSkills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) acc[skill.category] = [];
      acc[skill.category].push(skill);
      return acc;
    },
    {} as Record<string, typeof skillsData.suggestedSkills>
  );

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGridIcon className="size-5" />
            <CardTitle className="text-base">Skills Optimization</CardTitle>
          </div>
        </div>
        <CardDescription>
          Reorganized skills based on job requirements
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* improvements Summary */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <h4 className="font-semibold text-sm mb-2">Key Improvements</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {skillsData.improvements.map((imp, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Before/After Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowOriginal(!showOriginal)}
          className="w-full"
        >
          {showOriginal ? (
            <>
              <ChevronUpIcon className="mr-2 size-4" />
              Hide Original Skills
            </>
          ) : (
            <>
              <ChevronDownIcon className="mr-2 size-4" />
              Compare with Original
            </>
          )}
        </Button>

        {showOriginal && (
          <div className="space-y-2 rounded-lg border border-muted bg-muted/30 p-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Original Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {skillsData.originalSkills.map((s, i) => (
                <Badge key={i} variant="secondary" className="font-normal">
                  {s.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div className="space-y-4">
          <h4 className="font-semibold text-sm">Optimized Organization</h4>
          {Object.entries(groupedSkills).map(([category, skills]) => (
            <div key={category} className="space-y-2">
              <h5 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {category}
              </h5>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => (
                  <Badge
                    key={i}
                    variant={
                      skill.relevance === "high"
                        ? "default"
                        : skill.relevance === "medium"
                          ? "secondary"
                          : "outline"
                    }
                    className={`
                      ${skill.relevance === "high" ? "bg-primary text-primary-foreground" : ""}
                      ${skill.isNew ? "border-green-500 border-2" : ""}
                    `}
                  >
                    {skill.name}
                    {skill.isNew && (
                      <span className="ml-1 text-[10px] text-green-600 dark:text-green-400 font-bold">
                        NEW
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Reasoning */}
        <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
          <div className="flex gap-3">
            <LightbulbIcon className="mt-0.5 size-4 shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                AI Reasoning
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                {skillsData.reasoning}
              </p>
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Button
          onClick={handleAccept}
          disabled={isSubmitting}
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
          Skip Skills
        </Button>
      </CardFooter>
    </Card>
  );
}
