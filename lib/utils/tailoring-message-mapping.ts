import type { Prisma } from "@/lib/generated/prisma/client";
import type { ResumeTailorAgentUIMessage } from "@/ai/agent";
import type { TailoringProviderMetadata } from "@/lib/types/tailoring-chat";

// Type for inserting a new part
type DBPartInsert = Prisma.TailoringMessagePartCreateManyInput;

// Type for selecting a part from DB
type DBPartSelect = Prisma.TailoringMessagePartGetPayload<object>;

/**
 * Maps UI message parts to database part records for insertion.
 * Uses generic JSONB columns for tool input/output - no per-tool columns needed.
 */
export function mapUIMessagePartsToDBParts(
  parts: ResumeTailorAgentUIMessage["parts"],
  messageId: string
): DBPartInsert[] {
  const result: DBPartInsert[] = [];

  parts.forEach((part, index) => {
    switch (part.type) {
      case "step-start":
        result.push({
          messageId,
          order: index,
          type: "step-start",
        });
        break;

      case "text":
        result.push({
          messageId,
          order: index,
          type: "text",
          text: part.text,
        });
        break;

      case "reasoning":
        result.push({
          messageId,
          order: index,
          type: "reasoning",
          reasoning: part.text,
          providerMetadata: part.providerMetadata as
            | TailoringProviderMetadata
            | undefined,
        });
        break;

      default:
        // Handle all tool-* types generically
        if (part.type.startsWith("tool-") || part.type === "dynamic-tool") {
          const toolName = part.type.replace("tool-", "");
          const toolPart = part as {
            toolCallId: string;
            state: string;
            input?: unknown;
            output?: unknown;
            errorText?: string;
          };

          result.push({
            messageId,
            order: index,
            type: "tool-invocation",
            toolCallId: toolPart.toolCallId,
            toolName,
            toolState: toolPart.state,
            toolInput: toolPart.input as Prisma.InputJsonValue | undefined,
            toolOutput:
              toolPart.state === "output-available"
                ? (toolPart.output as Prisma.InputJsonValue | undefined)
                : undefined,
            toolError:
              toolPart.state === "output-error"
                ? toolPart.errorText
                : undefined,
          });
        } else {
          console.warn(`Unhandled part type: ${part.type}`);
        }
        break;
    }
  });

  return result;
}

/**
 * Maps a database part record back to a UI message part.
 * Reconstructs typed parts from generic columns.
 */
export function mapDBPartToUIMessagePart(
  part: DBPartSelect
): ResumeTailorAgentUIMessage["parts"][number] {
  switch (part.type) {
    case "text":
      return {
        type: "text",
        text: part.text!,
      };

    case "reasoning":
      return {
        type: "reasoning",
        text: part.reasoning!,
        providerMetadata:
          (part.providerMetadata as TailoringProviderMetadata) ?? undefined,
      };

    case "step-start":
      return {
        type: "step-start",
      };

    case "tool-invocation":
      return mapGenericToolPart(part);

    default:
      throw new Error(`Unsupported part type in DB->UI mapping: ${part.type}`);
  }
}

/**
 * Maps a generic tool invocation from DB back to typed UI part.
 */
function mapGenericToolPart(
  part: DBPartSelect
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const type = `tool-${part.toolName}` as const;
  const state = part.toolState!;
  const toolCallId = part.toolCallId!;

  const basePart = {
    type,
    toolCallId,
    state,
    input: part.toolInput,
  };

  switch (state) {
    case "input-streaming":
    case "input-available":
    case "approval-requested":
    case "approval-responded":
      return basePart;

    case "output-available":
      return {
        ...basePart,
        output: part.toolOutput,
      };

    case "output-error":
    case "output-denied":
      return {
        ...basePart,
        errorText: part.toolError,
      };

    default:
      console.warn(`Unknown tool state: ${state}`);
      return basePart;
  }
}
