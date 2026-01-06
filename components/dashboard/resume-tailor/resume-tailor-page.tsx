"use client";

import { useState, useMemo, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputBody,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { JobDetailsCard, type JobDetailsData } from "./job-details-card";
import { SummaryApprovalCard } from "./summary-approval-card";
import { PDFPreview } from "@/components/pdf/pdf-preview";
import {
  WandIcon,
  Loader2Icon,
  CheckCircle2Icon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ResumeTailorAgentUIMessage } from "@/ai/agent";
import type {
  ExperienceApproval,
  SummaryApproval,
  TailoredExperienceOutput,
  TailoredSummaryOutput,
} from "@/ai/tool/resume-tailor";
import type { ResumeData } from "@/lib/types/resume";
import { PlanProgressCard } from "./plan-progress-card";
import type { TailoringPlan } from "@/ai/tool/resume-tailor";
import { ExperienceApprovalCard } from "./experience-approval-card";
import { approveExperienceEntryTool } from "@/ai/tool/resume-tailor";
import { UIToolInvocation } from "ai";

interface ResumeTailorPageProps {
  initialProfile: ResumeData;
  resumeId: string;
}

interface ApprovedChanges {
  summary?: { approved: boolean; text?: string };
  experiences?: Record<string, { approved: boolean; bullets?: string[] }>;
}

/**
 * Helper function to find the experience data for an approval step
 * @param part - The approval tool part
 * @param tailoredExperiences - Map of tailored experiences by ID
 * @param messages - All messages up to current point
 * @param currentMsg - The current message being rendered
 * @returns The experience data to display, or undefined if not found
 */
function findExperienceForApproval(
  part: UIToolInvocation<typeof approveExperienceEntryTool>,
  tailoredExperiences: Record<string, TailoredExperienceOutput>,
  messages: ResumeTailorAgentUIMessage[],
  currentMsg: ResumeTailorAgentUIMessage
): TailoredExperienceOutput | undefined {
  if (part.state === "output-available") {
    // Approval completed - get experience data using the ID from output
    const expId = part.output.experienceId;
    return tailoredExperiences[expId];
  }

  // Approval in progress - find the most recently tailored experience
  // that hasn't been approved yet by checking message history
  const allMessages = messages.slice(0, messages.indexOf(currentMsg) + 1);
  const approvedExpIds = new Set<string>();

  // Collect all approved experience IDs from previous messages
  for (const m of allMessages) {
    for (const p of m.parts) {
      if (
        p.type === "tool-approveExperienceEntry" &&
        p.state === "output-available"
      ) {
        approvedExpIds.add(p.output.experienceId);
      }
    }
  }

  // Find the first tailored experience that hasn't been approved
  const unapprovedExpId = Object.keys(tailoredExperiences).find(
    (expId) => !approvedExpIds.has(expId)
  );

  return unapprovedExpId ? tailoredExperiences[unapprovedExpId] : undefined;
}

export function ResumeTailorPage({ initialProfile }: ResumeTailorPageProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [approvedChanges, setApprovedChanges] = useState<ApprovedChanges>({});

  const { messages, sendMessage, addToolOutput, status } =
    useChat<ResumeTailorAgentUIMessage>({
      transport: new DefaultChatTransport({
        api: "/api/resume-tailor",
      }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    });

  // Derive tailored data and plan directly from messages
  const { tailoredData, plan, completedStepIds, currentStepId } =
    useMemo(() => {
      let summary: TailoredSummaryOutput | undefined;
      const experiences: Record<string, TailoredExperienceOutput> = {};
      let plan: TailoringPlan | null = null;
      const completed = new Set<string>();
      let currentId: string | undefined;

      for (const msg of messages) {
        for (const part of msg.parts) {
          // Extract plan
          if (
            part.type === "tool-createTailoringPlan" &&
            part.state === "output-available"
          ) {
            plan = part.output;
          }

          // Track JD collection
          if (part.type === "tool-collectJobDetails") {
            if (part.state === "output-available") {
              completed.add("collect_jd");
            } else if (
              part.state === "input-available" ||
              part.state === "input-streaming"
            ) {
              currentId = "collect_jd";
            }
          }

          // Track Summary
          if (part.type === "tool-tailorSummary") {
            if (part.state === "output-available") {
              summary = part.output;
              completed.add("tailor_summary");
            } else if (part.state === "input-streaming") {
              currentId = "tailor_summary";
            }
          }

          // Track Approval
          if (part.type === "tool-approveSummary") {
            if (part.state === "output-available") {
              completed.add("approve_summary");
            } else if (
              part.state === "input-available" ||
              part.state === "input-streaming" ||
              part.state === "approval-requested"
            ) {
              currentId = "approve_summary";
            }
          }

          // Track Experience Tailoring
          if (part.type === "tool-tailorExperienceEntry") {
            if (part.state === "output-available") {
              experiences[part.output.experienceId] = part.output;
              completed.add(`tailor_exp_${part.output.experienceId}`);
            } else if (part.state === "input-streaming") {
              // Try to find experienceId in input if available
              const expId = part.input?.experienceId;
              if (expId) {
                currentId = `tailor_exp_${expId}`;
              }
            }
          }

          // Track Experience Approval
          if (part.type === "tool-approveExperienceEntry") {
            if (part.state === "output-available") {
              completed.add(`approve_exp_${part.output.experienceId}`);
            } else if (
              part.state === "input-available" ||
              part.state === "input-streaming" ||
              part.state === "approval-requested"
            ) {
              currentId = "approve_experience";
            }
          }
        }
      }

      return {
        tailoredData: { summary, experiences },
        plan,
        completedStepIds: completed,
        currentStepId: currentId,
      };
    }, [messages]);

  // Determine the active step ID for plan progress tracking
  const activeStepId = useMemo(() => {
    if (currentStepId) return currentStepId;
    if (!plan || status !== "streaming") return undefined;

    // Find the first incomplete step
    return plan.steps.find((s) => !completedStepIds.has(s.id))?.id;
  }, [plan, completedStepIds, currentStepId, status]);

  // Build live preview data by applying approved changes to initial profile
  const previewData = useMemo((): ResumeData => {
    const preview = { ...initialProfile };

    // Apply approved summary
    if (approvedChanges.summary?.approved && approvedChanges.summary.text) {
      preview.bio = approvedChanges.summary.text;
    }

    // Apply approved experience changes
    if (approvedChanges.experiences) {
      preview.workExperiences = preview.workExperiences.map((exp) => {
        // Find the matching experience by comparing company and position
        const matchingExpId = Object.keys(
          approvedChanges.experiences || {}
        ).find((expId) => {
          const tailoredExp = tailoredData.experiences[expId];
          return (
            tailoredExp &&
            tailoredExp.originalCompany === exp.company &&
            tailoredExp.originalRole === exp.position
          );
        });

        if (matchingExpId) {
          const change = approvedChanges.experiences?.[matchingExpId];
          if (change?.approved && change.bullets) {
            return { ...exp, bullets: change.bullets };
          }
        }
        return exp;
      });
    }

    return preview;
  }, [initialProfile, approvedChanges, tailoredData.experiences]);

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = useCallback(
    async ({ text }: { text: string }) => {
      if (!text.trim()) return;
      sendMessage({ text });
    },
    [sendMessage]
  );

  const handleJobDetailsSubmit = useCallback(
    (toolCallId: string, data: JobDetailsData) => {
      addToolOutput({
        tool: "collectJobDetails",
        toolCallId,
        output: data,
      });
    },
    [addToolOutput]
  );

  const handleSummaryApproval = useCallback(
    (toolCallId: string, data: SummaryApproval) => {
      setApprovedChanges((prev) => ({
        ...prev,
        summary: {
          approved: data.approved,
          text: data.customText || tailoredData.summary?.suggested,
        },
      }));

      addToolOutput({
        tool: "approveSummary",
        toolCallId,
        output: data,
      });
    },
    [addToolOutput, tailoredData.summary]
  );

  const handleExperienceApproval = useCallback(
    (toolCallId: string, data: ExperienceApproval) => {
      const expId = data.experienceId;
      const suggestedBullets =
        tailoredData.experiences[expId]?.suggestedBullets;

      setApprovedChanges((prev) => ({
        ...prev,
        experiences: {
          ...prev.experiences,
          [expId]: {
            approved: data.approved,
            bullets: data.finalBullets || suggestedBullets,
          },
        },
      }));

      addToolOutput({
        tool: "approveExperienceEntry",
        toolCallId,
        output: data,
      });
    },
    [addToolOutput, tailoredData.experiences]
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* PDF Preview Panel */}
      <div
        className={cn(
          "border-r bg-muted/30 transition-all duration-300",
          showPreview ? "w-1/2" : "w-0 overflow-hidden"
        )}
      >
        {showPreview && (
          <div className="h-full p-4">
            <PDFPreview
              profile={previewData}
              title="Live Preview"
              showDownload={true}
              height="calc(100vh - 10rem)"
            />
          </div>
        )}
      </div>

      {/* Chat Panel */}
      <div className="flex flex-1 flex-col">
        {/* Toggle Button */}
        <div className="flex items-center justify-between border-b px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? (
              <>
                <PanelLeftCloseIcon className="mr-2 size-4" />
                Hide Preview
              </>
            ) : (
              <>
                <PanelLeftOpenIcon className="mr-2 size-4" />
                Show Preview
              </>
            )}
          </Button>
          <div className="flex gap-2">
            {approvedChanges.summary?.approved && (
              <Badge variant="secondary" className="text-xs">
                Summary updated
              </Badge>
            )}
            {Object.values(approvedChanges.experiences || {}).some(
              (e) => e.approved
            ) && (
              <Badge variant="secondary" className="text-xs">
                Experience updated
              </Badge>
            )}
          </div>
        </div>

        {/* Chat Content */}
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                title="Resume Tailor"
                description="I'll help you tailor your professional summary for a specific job. Just tell me the job you're applying for and I'll suggest improvements."
                icon={<WandIcon className="size-12" />}
              />
            ) : (
              <>
                {messages.map((msg) => (
                  <Message key={msg.id} from={msg.role}>
                    <MessageContent>
                      {msg.parts.map((part, i) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <MessageResponse key={`${msg.id}-${i}`}>
                                {part.text}
                              </MessageResponse>
                            );

                          case "tool-createTailoringPlan":
                            if (part.state === "output-available") {
                              return (
                                <PlanProgressCard
                                  key={part.toolCallId}
                                  plan={part.output}
                                  completedStepIds={completedStepIds}
                                  currentStepId={activeStepId}
                                />
                              );
                            }
                            return (
                              <div
                                key={part.toolCallId}
                                className="flex items-center gap-2 text-muted-foreground"
                              >
                                <Loader2Icon className="size-4 animate-spin" />
                                <span>Creating tailoring plan...</span>
                              </div>
                            );

                          case "tool-collectJobDetails":
                            return (
                              <JobDetailsCard
                                key={part.toolCallId}
                                part={part}
                                onSubmit={(data) =>
                                  handleJobDetailsSubmit(part.toolCallId, data)
                                }
                              />
                            );

                          case "tool-tailorSummary":
                            if (part.state === "output-available") {
                              return (
                                <Card
                                  key={part.toolCallId}
                                  className="w-full max-w-2xl"
                                >
                                  <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                      <CheckCircle2Icon className="size-4" />
                                      <CardTitle className="text-sm">
                                        Summary Generated
                                      </CardTitle>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                      {part.output.suggested.slice(0, 100)}...
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-1">
                                      {part.output.keywordsIncorporated
                                        .slice(0, 5)
                                        .map((kw, j) => (
                                          <Badge
                                            key={j}
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {kw}
                                          </Badge>
                                        ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            }
                            return (
                              <div
                                key={part.toolCallId}
                                className="flex items-center gap-2 text-muted-foreground"
                              >
                                <Loader2Icon className="size-4 animate-spin" />
                                <span>Generating tailored summary...</span>
                              </div>
                            );

                          case "tool-approveSummary":
                            return (
                              <SummaryApprovalCard
                                key={part.toolCallId}
                                part={part}
                                summaryData={tailoredData.summary}
                                onSubmit={(data) =>
                                  handleSummaryApproval(part.toolCallId, data)
                                }
                              />
                            );

                          case "tool-tailorExperienceEntry":
                            if (part.state !== "output-available") {
                              return (
                                <div
                                  key={part.toolCallId}
                                  className="flex items-center gap-2 text-muted-foreground"
                                >
                                  <Loader2Icon className="size-4 animate-spin" />
                                  <span>Optimizing experience bullets...</span>
                                </div>
                              );
                            }
                            return null; // Don't show card for this, wait for approval step

                          case "tool-approveExperienceEntry": {
                            const expData = findExperienceForApproval(
                              part,
                              tailoredData.experiences,
                              messages,
                              msg
                            );

                            if (!expData) return null;

                            return (
                              <ExperienceApprovalCard
                                key={part.toolCallId}
                                part={part}
                                experienceData={expData}
                                onSubmit={(data) =>
                                  handleExperienceApproval(
                                    part.toolCallId,
                                    data
                                  )
                                }
                              />
                            );
                          }

                          default:
                            return null;
                        }
                      })}
                    </MessageContent>
                  </Message>
                ))}
                {isLoading && (
                  <Message from="assistant">
                    <MessageContent>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2Icon className="size-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </MessageContent>
                  </Message>
                )}
              </>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        <div className="border-t p-4">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputBody>
              <PromptInputTextarea
                placeholder="Ask me to tailor your resume for a job..."
                disabled={isLoading}
              />
            </PromptInputBody>
            <PromptInputFooter>
              <PromptInputTools />
              <PromptInputSubmit
                status={isLoading ? "streaming" : undefined}
                disabled={isLoading}
              />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </div>
  );
}
