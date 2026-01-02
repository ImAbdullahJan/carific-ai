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
  SummaryApproval,
  TailoredSummaryOutput,
} from "@/ai/tool/resume-tailor";
import type { ResumeData } from "@/lib/types/resume";
import { PlanProgressCard } from "./plan-progress-card";
import type { TailoringPlan, PlanStepType } from "@/ai/tool/resume-tailor";

interface ResumeTailorPageProps {
  initialProfile: ResumeData;
  resumeId: string;
}

interface ApprovedChanges {
  summary?: { approved: boolean; text?: string };
}

export function ResumeTailorPage({
  initialProfile,
  resumeId,
}: ResumeTailorPageProps) {
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
  const { tailoredData, plan, completedSteps, currentStep } = useMemo(() => {
    let summary: TailoredSummaryOutput | undefined;
    let plan: TailoringPlan | null = null;
    const completed = new Set<PlanStepType>();
    let current: PlanStepType | undefined;

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
        if (
          part.type === "tool-collectJobDetails" &&
          part.state === "output-available"
        ) {
          completed.add("collect_jd");
        }

        // Track Summary
        if (part.type === "tool-tailorSummary") {
          if (part.state === "output-available") {
            summary = part.output;
            completed.add("tailor_summary");
          } else if (part.state === "input-streaming") {
            current = "tailor_summary";
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
            current = "approve_summary";
          }
        }
      }
    }
    return {
      tailoredData: { summary },
      plan,
      completedSteps: completed,
      currentStep: current,
    };
  }, [messages]);

  // Build live preview data by applying approved changes to initial profile
  const previewData = useMemo((): ResumeData => {
    const preview = { ...initialProfile };

    // Apply approved summary
    if (approvedChanges.summary?.approved && approvedChanges.summary.text) {
      preview.bio = approvedChanges.summary.text;
    }

    return preview;
  }, [initialProfile, approvedChanges]);

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
      // Update local state for live preview
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
          {approvedChanges.summary?.approved ? (
            <Badge variant="secondary" className="text-xs">
              Summary updated
            </Badge>
          ) : null}
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
                                  completedSteps={completedSteps}
                                  currentStep={currentStep}
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
