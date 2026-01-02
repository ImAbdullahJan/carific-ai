import { tool } from "ai";
import { z } from "zod";

export const collectJobDetailsTool = tool({
  description:
    "Show a form to collect job title and job description from the user. Call this immediately after creating the plan. No message needed - the form is self-explanatory.",
  inputSchema: z.object({}),
  strict: true,
  outputSchema: z.object({
    jobTitle: z.string(),
    jobDescription: z.string(),
  }),
});
