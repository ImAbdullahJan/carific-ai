"use client";

import { useChat } from "@ai-sdk/react";
import {
  DefaultChatTransport,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { BriefcaseIcon, Loader2Icon } from "lucide-react";

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
import { AnalysisResultCard } from "./analysis-result-card";
import type { ResumeChatAgentUIMessage } from "@/ai/agent";

export function ResumeChat() {
  const { messages, sendMessage, addToolOutput, status } =
    useChat<ResumeChatAgentUIMessage>({
      transport: new DefaultChatTransport({
        api: "/api/resume-chat",
      }),
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    });

  const isLoading = status === "streaming" || status === "submitted";

  const handleSubmit = async ({ text }: { text: string }) => {
    if (!text.trim()) return;
    sendMessage({ text });
  };

  const handleJobDetailsSubmit = (toolCallId: string, data: JobDetailsData) => {
    addToolOutput({
      tool: "collectJobDetails",
      toolCallId,
      output: data,
    });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      <div className="w-1/2 bg-black" />

      <div className="flex w-1/2 flex-col">
        <Conversation className="flex-1">
          <ConversationContent>
            {messages.length === 0 ? (
              <ConversationEmptyState
                title="Resume Analysis Assistant"
                description="I can help you analyze job descriptions against your profile. Just ask me to analyze a job posting!"
                icon={<BriefcaseIcon className="size-12" />}
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

                          case "tool-analyzeJobMatch":
                            return (
                              <AnalysisResultCard
                                key={part.toolCallId}
                                part={part}
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
                placeholder="Ask me to analyze a job posting..."
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
