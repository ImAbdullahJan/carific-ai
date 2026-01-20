"use client";

import { useState, useMemo, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
  lastAssistantMessageIsCompleteWithApprovalResponses,
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
  AlertCircleIcon,
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
  SkillsApproval,
} from "@/ai/tool/resume-tailor";
import type { ResumeData } from "@/lib/types/resume";
import { PlanProgressCard } from "./plan-progress-card";
import { ExperienceApprovalCard } from "./experience-approval-card";
import { SkillsApprovalCard } from "./skills-approval-card";
import { StepGuide } from "./step-guide";
import { RetryCard } from "./retry-card";
import { ToolErrorCard } from "./tool-error-card";
import {
  getExperienceNameFromPlan,
  findExperienceForApproval,
} from "@/lib/utils/resume-tailor";

interface ResumeTailorPageProps {
  initialProfile: ResumeData;
  chatId: string;
  initialMessages?: ResumeTailorAgentUIMessage[];
}

import { deriveTailorState } from "@/lib/utils/resume-tailor-reducer";

export function ResumeTailorPage({
  initialProfile,
  chatId,
  initialMessages,
}: ResumeTailorPageProps) {
  const [showPreview, setShowPreview] = useState(true);

  const {
    messages,
    sendMessage,
    addToolOutput,
    addToolApprovalResponse,
    status,
    regenerate,
  } = useChat<ResumeTailorAgentUIMessage>({
    id: chatId,
    messages: initialMessages,
    transport: new DefaultChatTransport({
      api: "/api/resume-tailor",
      prepareSendMessagesRequest: ({ messages: msgs }) => {
        // Send only the last message + chatId (server loads full history)
        const lastMessage = msgs[msgs.length - 1];
        return {
          body: {
            message: lastMessage,
            chatId,
          },
        };
      },
    }),
    sendAutomaticallyWhen: (options) => {
      // Auto-submit when all tool calls are complete OR all approvals are responded to
      return (
        lastAssistantMessageIsCompleteWithToolCalls(options) ||
        lastAssistantMessageIsCompleteWithApprovalResponses(options)
      );
    },
  });

  // Derive entire application state from messages using pure reducer
  const {
    plan,
    planSteps,
    tailoredData,
    approvedChanges,
    previewData,
    hasPendingApproval,
  } = useMemo(
    () => deriveTailorState(messages, initialProfile),
    [messages, initialProfile]
  );

  // Detect stuck state: stream disconnected before agent could respond
  // Case 1: Last message is from user (no assistant response at all)
  // Case 2: Last message is assistant but only has step-start (incomplete response)
  const stuckState = useMemo(() => {
    if (messages.length === 0) return null;
    if (status === "streaming" || status === "submitted") return null;

    const lastMessage = messages[messages.length - 1];

    // Case 1: Last message is from user - no response at all
    if (lastMessage.role === "user") {
      const textPart = lastMessage.parts.find((p) => p.type === "text");
      const messageText =
        textPart && "text" in textPart ? textPart.text : undefined;

      return {
        messageId: lastMessage.id,
        messageText,
      };
    }

    // Case 2: Last message is assistant but has no meaningful content
    // This happens when stream started but disconnected before any content
    if (lastMessage.role === "assistant") {
      // Check if the message has any meaningful content parts
      const hasMeaningfulContent = lastMessage.parts.some(
        (p) =>
          p.type === "text" ||
          p.type === "reasoning" ||
          p.type.startsWith("tool-")
      );

      if (!hasMeaningfulContent && messages.length >= 2) {
        // Find the user message that triggered this incomplete response
        const userMessage = messages[messages.length - 2];
        if (userMessage?.role === "user") {
          const textPart = userMessage.parts.find((p) => p.type === "text");
          const messageText =
            textPart && "text" in textPart ? textPart.text : undefined;

          return {
            messageId: userMessage.id,
            messageText,
          };
        }
      }
    }

    return null;
  }, [messages, status]);

  const isLoading = status === "streaming" || status === "submitted";

  // Handle retry for stuck messages - uses reload() to regenerate response
  const handleRetry = useCallback(() => {
    if (!stuckState) return;
    regenerate();
  }, [stuckState, regenerate]);

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
    async (toolCallId: string, data: SummaryApproval) => {
      addToolOutput({
        tool: "approveSummary",
        toolCallId,
        output: data,
      });
    },
    [addToolOutput]
  );

  const handleExperienceApproval = useCallback(
    async (toolCallId: string, data: ExperienceApproval) => {
      addToolOutput({
        tool: "approveExperienceEntry",
        toolCallId,
        output: data,
      });
    },
    [addToolOutput]
  );

  const handleSkillsApproval = useCallback(
    async (toolCallId: string, data: SkillsApproval) => {
      addToolOutput({
        tool: "approveSkills",
        toolCallId,
        output: data,
      });
    },
    [addToolOutput]
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
              <>
                <ConversationEmptyState
                  title="Resume Tailor"
                  description="I'll help you tailor your professional summary for a specific job. Just tell me the job you're applying for and I'll suggest improvements."
                  icon={<WandIcon className="size-12" />}
                />
                {/* Step Guide - Shows welcome message when no messages */}
                {!isLoading && (
                  <StepGuide
                    planSteps={planSteps}
                    hasMessages={false}
                    isStreaming={false}
                    onStart={() =>
                      sendMessage({
                        role: "user",
                        parts: [
                          {
                            type: "text",
                            text: "Let's start tailoring my resume!",
                          },
                        ],
                      })
                    }
                  />
                )}
              </>
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
                                  planSteps={planSteps}
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
                            if (part.state === "output-error") {
                              return (
                                <ToolErrorCard
                                  key={part.toolCallId}
                                  title="Failed to generate summary"
                                  errorText={part.errorText}
                                  defaultMessage="An error occurred while tailoring the summary."
                                />
                              );
                            }
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
                            if (!tailoredData.summary) return null;
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

                          case "tool-tailorExperienceEntry": {
                            const expId = part.input?.experienceId;
                            const expName = getExperienceNameFromPlan(
                              expId,
                              plan
                            );
                            if (part.state === "output-error") {
                              return (
                                <ToolErrorCard
                                  key={part.toolCallId}
                                  title={`Failed to optimize ${expName}`}
                                  errorText={part.errorText}
                                  defaultMessage="An error occurred while tailoring the experience entry."
                                />
                              );
                            }
                            if (part.state !== "output-available") {
                              return (
                                <div
                                  key={part.toolCallId}
                                  className="flex items-center gap-2 text-muted-foreground"
                                >
                                  <Loader2Icon className="size-4 animate-spin" />
                                  <span>Optimizing {expName}...</span>
                                </div>
                              );
                            }
                            return null; // Don't show card for this, wait for approval step
                          }

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

                          case "tool-tailorSkills":
                            if (part.state === "output-error") {
                              return (
                                <ToolErrorCard
                                  key={part.toolCallId}
                                  title="Failed to analyze skills"
                                  errorText={part.errorText}
                                  defaultMessage="An error occurred while tailoring skills."
                                />
                              );
                            }
                            if (part.state !== "output-available") {
                              return (
                                <div
                                  key={part.toolCallId}
                                  className="flex items-center gap-2 text-muted-foreground"
                                >
                                  <Loader2Icon className="size-4 animate-spin" />
                                  <span>Analyzing skills relevance...</span>
                                </div>
                              );
                            }
                            return null;

                          case "tool-approveSkills":
                            if (!tailoredData.skills) return null;
                            return (
                              <SkillsApprovalCard
                                key={part.toolCallId}
                                part={part}
                                skillsData={tailoredData.skills}
                                onSubmit={(data) =>
                                  handleSkillsApproval(part.toolCallId, data)
                                }
                              />
                            );

                          case "tool-skipStep":
                            if (part.state === "approval-requested") {
                              const stepId = part.input?.stepId;
                              const stepTitle =
                                getExperienceNameFromPlan(stepId, plan) ||
                                stepId;

                              return (
                                <Card
                                  key={part.toolCallId}
                                  className="w-full max-w-2xl"
                                >
                                  <CardHeader className="pb-2">
                                    <div className="flex items-center gap-2">
                                      <AlertCircleIcon className="size-4" />
                                      <CardTitle className="text-sm">
                                        Agent Suggests Skipping: {stepTitle}
                                      </CardTitle>
                                    </div>
                                  </CardHeader>
                                  <CardContent>
                                    <p className="text-sm text-muted-foreground mb-4">
                                      I encountered an issue with this step and
                                      suggest we skip it to continue. Would you
                                      like to skip it or should I try again?
                                    </p>
                                    <div className="flex gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8"
                                        onClick={() =>
                                          addToolApprovalResponse({
                                            id: part.approval.id,
                                            approved: true,
                                            reason:
                                              "user wants to skip the step",
                                          })
                                        }
                                      >
                                        Skip Step
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-8"
                                        onClick={() =>
                                          addToolApprovalResponse({
                                            id: part.approval.id,
                                            approved: false,
                                            reason:
                                              "user wants to try again the last error step",
                                          })
                                        }
                                      >
                                        Try Again
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            }

                            if (part.state === "approval-responded") {
                              const isSkipping = part.approval.approved;
                              return (
                                <div
                                  key={part.toolCallId}
                                  className="flex items-center gap-2 text-muted-foreground"
                                >
                                  <Loader2Icon className="size-4 animate-spin" />
                                  <span>
                                    {isSkipping
                                      ? "Skipping step..."
                                      : "Retrying step..."}
                                  </span>
                                </div>
                              );
                            }

                            if (part.state === "output-denied") {
                              return (
                                <div
                                  key={part.toolCallId}
                                  className="flex items-center gap-2 text-muted-foreground"
                                >
                                  Retried step
                                </div>
                              );
                            }
                            if (part.state === "output-available") {
                              return (
                                <Card
                                  key={part.toolCallId}
                                  className="w-full max-w-2xl border-muted"
                                >
                                  <CardContent className="pt-4">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <Badge variant="outline">Skipped</Badge>
                                      <span>
                                        Step skipped: {part.output.stepId}
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            }
                            return null;

                          case "tool-getPendingSteps":
                            if (part.state === "output-available") {
                              const {
                                pendingCount,
                                completedCount,
                                totalCount,
                              } = part.output;
                              return (
                                <div
                                  key={part.toolCallId}
                                  className="flex items-center gap-2 text-xs text-muted-foreground"
                                >
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {completedCount}/{totalCount} done
                                  </Badge>
                                  {pendingCount > 0 && (
                                    <span>{pendingCount} steps remaining</span>
                                  )}
                                </div>
                              );
                            }
                            return null;

                          default:
                            return null;
                        }
                      })}
                    </MessageContent>
                  </Message>
                ))}
                {/* Step Guide - Shows when agent stops, no pending approvals, and not stuck */}
                {!isLoading && !hasPendingApproval && !stuckState && (
                  <StepGuide
                    planSteps={planSteps}
                    hasMessages={messages.length > 0}
                    isStreaming={false}
                    onContinue={() =>
                      sendMessage({
                        role: "user",
                        parts: [
                          { type: "text", text: "Continue to the next step" },
                        ],
                      })
                    }
                  />
                )}
                {/* Retry Card - Shows when stream disconnected before response */}
                {stuckState && !isLoading && (
                  <RetryCard
                    failedMessage={stuckState.messageText}
                    onRetry={handleRetry}
                    isRetrying={isLoading}
                  />
                )}
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
