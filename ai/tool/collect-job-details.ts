import { tool } from "ai";
import { z } from "zod";

export const collectJobDetailsTool = tool({
  description:
    "Show a form to collect job title and job description from the user. Use this when the user wants to analyze a job posting.",
  inputSchema: z.object({
    message: z
      .string()
      .describe(
        "A brief message to show above the form, e.g., 'Please enter the job details'"
      ),
  }),
  outputSchema: z.object({
    jobTitle: z.string(),
    jobDescription: z.string(),
  }),
});
