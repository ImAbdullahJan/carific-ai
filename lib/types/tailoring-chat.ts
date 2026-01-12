import type { UIMessage, UIMessagePart, InferUITools, JSONValue } from "ai";
import type { createResumeTailorAgent } from "@/ai/agent";
import type {
  TailoringPlan,
  TailoredSummaryOutput,
  SummaryApproval,
  TailoredExperienceOutput,
  ExperienceApproval,
  TailoredSkillsOutput,
  SkillsApproval,
} from "@/ai/tool/resume-tailor";

// Infer tool types from the agent (using ReturnType since it's now a factory)
type AgentInstance = ReturnType<typeof createResumeTailorAgent>;
export type TailoringToolSet = InferUITools<AgentInstance["tools"]>;

// No custom data parts for now
export type TailoringDataPart = Record<string, never>;

// No custom metadata for now
export type TailoringMetadata = Record<string, never>;

// The UIMessage type for tailoring chat
export type TailoringUIMessage = UIMessage<
  TailoringMetadata,
  TailoringDataPart,
  TailoringToolSet
>;

export type TailoringUIMessagePart = UIMessagePart<
  TailoringDataPart,
  TailoringToolSet
>;

// Provider metadata type
export type TailoringProviderMetadata = Record<
  string,
  Record<string, JSONValue>
>;

// Tool state type (matches AI SDK ToolUIPart states)
export type ToolState =
  | "input-streaming"
  | "input-available"
  | "output-available"
  | "output-error"
  | "approval-requested"
  | "approval-responded"
  | "output-denied";

// Tool input/output types for type-safe mapping
export type ToolInputOutputTypes = {
  createTailoringPlan: {
    input: Record<string, never>;
    output: TailoringPlan;
  };
  collectJobDetails: {
    input: Record<string, never>;
    output: { jobTitle: string; jobDescription: string };
  };
  tailorSummary: {
    input: { jobTitle: string; jobDescription: string };
    output: TailoredSummaryOutput;
  };
  approveSummary: {
    input: Record<string, never>;
    output: SummaryApproval;
  };
  tailorExperienceEntry: {
    input: { jobTitle: string; jobDescription: string; experienceId: string };
    output: TailoredExperienceOutput;
  };
  approveExperienceEntry: {
    input: Record<string, never>;
    output: ExperienceApproval;
  };
  tailorSkills: {
    input: { jobTitle: string; jobDescription: string };
    output: TailoredSkillsOutput;
  };
  approveSkills: {
    input: Record<string, never>;
    output: SkillsApproval;
  };
};

export type ToolName = keyof ToolInputOutputTypes;
