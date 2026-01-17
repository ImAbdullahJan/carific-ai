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
  TailoredSkillsOutput,
  SkillsApproval,
  TailoringPlan,
} from "@/ai/tool/resume-tailor";
import type { ResumeData } from "@/lib/types/resume";
import type { DBPlanStep } from "@/lib/db/tailoring-chat";
import { PlanProgressCard } from "./plan-progress-card";
import { ExperienceApprovalCard } from "./experience-approval-card";
import { SkillsApprovalCard } from "./skills-approval-card";
import { StepGuide } from "./step-guide";
import { RetryCard } from "./retry-card";
import { ToolErrorCard } from "./tool-error-card";
import { approveExperienceEntryTool } from "@/ai/tool/resume-tailor";
import { UIToolInvocation } from "ai";

interface ResumeTailorPageProps {
  initialProfile: ResumeData;
  chatId: string;
  initialMessages?: ResumeTailorAgentUIMessage[];
}

interface ApprovedChanges {
  summary?: { approved: boolean; text?: string };
  experiences?: Record<string, { approved: boolean; bullets?: string[] }>;
  skills?: {
    approved: boolean;
    finalSkills?: { name: string; category: string }[];
  };
}

/**
 * Helper function to get experience name from plan by experience ID
 */
function getExperienceNameFromPlan(
  experienceId: string | undefined,
  plan: TailoringPlan | null
): string {
  if (!experienceId || !plan) return "experience";
  const step = plan.steps.find(
    (s) =>
      s.type === "tailor_experience" && s.context?.experienceId === experienceId
  );
  // Label format is "Tailor: Position @ Company" - extract the part after "Tailor: "
  if (step?.label) {
    return step.label.replace("Tailor: ", "").replace(" @ ", " at ");
  }
  return "experience";
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

export function ResumeTailorPage({
  initialProfile,
  chatId,
  initialMessages,
}: ResumeTailorPageProps) {
  const [showPreview, setShowPreview] = useState(true);
  const [approvedChanges, setApprovedChanges] = useState<ApprovedChanges>({});

  const { messages, sendMessage, addToolOutput, status } =
    useChat<ResumeTailorAgentUIMessage>({
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
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    });

  // Derive tailored data and plan from messages (for displaying tool outputs)
  const { tailoredData, plan } = useMemo(() => {
    let summary: TailoredSummaryOutput | undefined;
    const experiences: Record<string, TailoredExperienceOutput> = {};
    let skills: TailoredSkillsOutput | undefined;
    let plan: TailoringPlan | null = null;

    for (const msg of messages) {
      for (const part of msg.parts) {
        // Extract plan (for experience name lookup)
        if (
          part.type === "tool-createTailoringPlan" &&
          part.state === "output-available"
        ) {
          plan = part.output;
        }

        // Extract summary output
        if (
          part.type === "tool-tailorSummary" &&
          part.state === "output-available"
        ) {
          summary = part.output;
        }

        // Extract experience outputs
        if (
          part.type === "tool-tailorExperienceEntry" &&
          part.state === "output-available"
        ) {
          experiences[part.output.experienceId] = part.output;
        }

        // Extract skills output
        if (
          part.type === "tool-tailorSkills" &&
          part.state === "output-available"
        ) {
          skills = part.output;
        }
      }
    }

    return {
      tailoredData: { summary, experiences, skills },
      plan,
    };
  }, [messages]);

  // Derive plan steps status optimistically from messages
  const planSteps = useMemo(() => {
    if (!plan) return [];

    // Map tool execution to step status
    const completedStepIds = new Set<string>();
    const inProgressStepIds = new Set<string>();
    const skippedStepIds = new Set<string>();

    for (const msg of messages) {
      for (const part of msg.parts) {
        if (!part.type.startsWith("tool-")) continue;

        let stepId: string | null = null;
        if (part.type === "tool-collectJobDetails") stepId = "collect_jd";
        else if (part.type === "tool-tailorSummary") stepId = "tailor_summary";
        else if (part.type === "tool-approveSummary")
          stepId = "approve_summary";
        else if (part.type === "tool-tailorSkills") stepId = "tailor_skills";
        else if (part.type === "tool-approveSkills") stepId = "approve_skills";
        else if (part.type === "tool-tailorExperienceEntry") {
          const expId =
            part.state === "output-available"
              ? part.output.experienceId
              : part.input?.experienceId;
          if (expId) stepId = `tailor_exp_${expId}`;
        } else if (part.type === "tool-approveExperienceEntry") {
          const expId =
            part.state === "output-available"
              ? part.output.experienceId
              : part.input?.experienceId;
          if (expId) stepId = `approve_exp_${expId}`;
        } else if (
          part.type === "tool-skipStep" &&
          part.state === "output-available"
        ) {
          skippedStepIds.add(part.output.stepId);
          if (part.output.relatedStepId) {
            skippedStepIds.add(part.output.relatedStepId);
          }
          continue; // Skip processing main logic for this part
        }

        if (!stepId) continue;

        if ("state" in part && part.state === "output-available") {
          completedStepIds.add(stepId);
        } else if (
          "state" in part &&
          (part.state === "streaming" ||
            part.state === "input-streaming" ||
            part.state === "input-available" ||
            part.state === "approval-requested")
        ) {
          inProgressStepIds.add(stepId);
        }
      }
    }

    return plan.steps.map((step, index) => {
      let status: DBPlanStep["status"] = "pending";
      if (skippedStepIds.has(step.id)) status = "skipped";
      else if (completedStepIds.has(step.id)) status = "completed";
      else if (inProgressStepIds.has(step.id)) status = "in_progress";

      return {
        id: step.id, // Using step.id as DB id for consistency
        stepId: step.id,
        type: step.type,
        label: step.label,
        description: step.description ?? null,
        order: index,
        experienceId: step.context?.experienceId ?? null,
        status,
      } as DBPlanStep;
    });
  }, [plan, messages]);

  // Check if there are any pending approval requests
  const hasPendingApproval = useMemo(() => {
    if (messages.length === 0) return false;

    // Check the last message for approval-requested state
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "assistant") return false;

    return lastMessage.parts.some((part) => {
      return (
        (part.type === "tool-approveSummary" ||
          part.type === "tool-approveExperienceEntry" ||
          part.type === "tool-approveSkills" ||
          part.type === "tool-collectJobDetails") &&
        (part.state === "approval-requested" ||
          part.state === "input-available")
      );
    });
  }, [messages]);

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

  // Build live preview data by applying approved changes to initial profile
  const previewData = useMemo((): ResumeData => {
    const preview = { ...initialProfile };

    // Apply approved summary
    if (approvedChanges.summary?.approved && approvedChanges.summary.text) {
      preview.bio = approvedChanges.summary.text;
    }

    // Apply approved skills changes
    if (
      approvedChanges.skills?.approved &&
      approvedChanges.skills.finalSkills
    ) {
      preview.skills = approvedChanges.skills.finalSkills.map((s) => ({
        name: s.name,
        category: s.category,
        level: null,
      }));
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

  // Handle retry for stuck messages - re-sends the last user message
  const handleRetry = useCallback(() => {
    if (!stuckState) return;

    // Re-send the same message to trigger the agent again
    sendMessage({
      role: "user",
      parts: [
        {
          type: "text",
          text: stuckState.messageText || "Please continue",
        },
      ],
    });
  }, [stuckState, sendMessage]);

  // Helper to skip a step - sends message to agent who will call skipStep tool
  const handleSkipStep = useCallback(
    async (stepId: string, skipMessage: string) => {
      sendMessage({
        role: "user",
        parts: [{ type: "text", text: skipMessage }],
      });
    },
    [sendMessage]
  );

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
    async (toolCallId: string, data: ExperienceApproval) => {
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

  const handleSkillsApproval = useCallback(
    async (toolCallId: string, data: SkillsApproval) => {
      setApprovedChanges((prev) => ({
        ...prev,
        skills: {
          approved: data.approved,
          finalSkills: data.finalSkills,
        },
      }));

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
                                  onRetry={() =>
                                    sendMessage({
                                      role: "user",
                                      parts: [
                                        {
                                          type: "text",
                                          text: "Please retry tailoring the summary.",
                                        },
                                      ],
                                    })
                                  }
                                  onSkip={() =>
                                    handleSkipStep(
                                      "tailor_summary",
                                      "Skip the summary and continue to the next step."
                                    )
                                  }
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
                                  onRetry={() =>
                                    sendMessage({
                                      role: "user",
                                      parts: [
                                        {
                                          type: "text",
                                          text: `Please retry tailoring ${expName}.`,
                                        },
                                      ],
                                    })
                                  }
                                  onSkip={() =>
                                    handleSkipStep(
                                      `tailor_exp_${expId}`,
                                      `Skip ${expName} and continue to the next step.`
                                    )
                                  }
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
                                  onRetry={() =>
                                    sendMessage({
                                      role: "user",
                                      parts: [
                                        {
                                          type: "text",
                                          text: "Please retry tailoring the skills.",
                                        },
                                      ],
                                    })
                                  }
                                  onSkip={() =>
                                    handleSkipStep(
                                      "tailor_skills",
                                      "Skip skills tailoring and finish."
                                    )
                                  }
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
