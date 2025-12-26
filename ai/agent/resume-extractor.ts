import { generateText, Output } from "ai";
import {
  ResumeExtractionSchema,
  type ResumeExtraction,
} from "@/lib/validations/resume-extraction";

// ============================================================
// RESUME EXTRACTION AI AGENT
// Extracts structured profile data from raw resume text
// ============================================================

const RESUME_EXTRACTION_SYSTEM_PROMPT = `You are an expert resume parser. Your task is to extract structured data from resume text with high accuracy.

## Your Mission
Transform unstructured resume text into a clean, structured JSON format that can be directly saved to a database.

## Extraction Guidelines

### Contact Information
- Extract the full name exactly as written (displayName)
- Look for professional titles/headlines near the name
- Extract email, phone, website, and location

### Social Links (CRITICAL)
- Extract ALL social profile links (LinkedIn, GitHub, Twitter, Dribbble, Behance, etc.)
- You MUST return the COMPLETE, VALID URL - not just the hyperlink text or username
- If the resume only shows a username or hyperlink text (e.g., "linkedin.com/in/johndoe" or "@johndoe"), construct the full URL:
  - LinkedIn: https://linkedin.com/in/{username}
  - GitHub: https://github.com/{username}
  - Twitter/X: https://twitter.com/{username}
  - Dribbble: https://dribbble.com/{username}
  - Behance: https://behance.net/{username}
  - Medium: https://medium.com/@{username}
- If you see text like "LinkedIn: johndoe" or "GitHub: @johndoe", extract the username and build the complete URL
- The URL field must ALWAYS be a complete, clickable URL starting with https://
- Set platform to lowercase: "linkedin", "github", "twitter", "dribbble", "behance", "medium", "custom"

### Work Experience
- Extract ALL work experiences, ordered from most recent to oldest
- For each position:
  - Company name (exact as written)
  - Job title/position
  - Location (city, state/country, or "Remote")
  - Start and end dates in ISO format (YYYY-MM-DD or YYYY-MM)
  - Set current=true if "Present", "Current", or no end date
  - Extract each bullet point as a separate string in the bullets array
  - Keep bullet text verbatim - do not modify or improve

### Volunteer Experience
- Similar structure to work experience
- Look for sections labeled: Volunteer, Community Service, Pro Bono, etc.

### Education
- Extract ALL education entries
- Degree type (Bachelor's, Master's, PhD, etc.)
- Field of study / Major
- School name
- Dates (graduation date or start-end)
- Highlights: GPA, honors, Dean's List, relevant coursework, activities

### Projects
- Personal, academic, or professional projects
- Name, description, URL if available
- Key highlights/technologies used

### Skills
- Extract ALL skills mentioned
- Categorize as: "Hard" or "Soft"
- Or use specific categories: "Languages", "Frameworks", "Tools", "Databases", "Cloud", "Soft Skills"
- Include proficiency level only if explicitly stated

### Certifications
- Full certification name
- Issuing organization
- Issue and expiry dates if mentioned
- Credential ID and verification URL if provided

### Languages
- Spoken/written languages (not programming languages)
- Proficiency: Native, Fluent, Professional, Conversational, Basic

### Achievements
- Awards, honors, recognitions
- Hackathon wins, competitions, publications mentions
- Include issuer and date if available

### Personal Details (if present)
- Date of birth, gender, nationality, marital status, visa status
- Only extract if explicitly mentioned - these are region-specific

### Hobbies/Interests
- Extract as a simple array of strings

## Date Formatting Rules
- Always output dates in ISO format: YYYY-MM-DD or YYYY-MM
- "January 2023" → "2023-01"
- "Jan 2023" → "2023-01"
- "2023" → "2023-01" (assume January if only year)
- "Present" / "Current" → set current=true and endDate=null

## Important Rules
1. Extract data EXACTLY as written - do not infer, improve, or embellish
2. If information is not present, use null (not empty string)
3. For arrays, use empty array [] if section doesn't exist, null if section exists but is empty
4. Preserve original formatting of names, titles, and company names
5. Be thorough - extract EVERYTHING from the resume
6. When in doubt about categorization, make your best judgment based on context`;

const MODEL = "google/gemini-2.5-flash-lite";

export interface ResumeExtractionOptions {
  /** The raw resume text to extract data from */
  resumeText: string;
  /** Optional hints about the resume format or context */
  hints?: string;
}

export interface ResumeExtractionResult {
  success: true;
  data: ResumeExtraction;
}

export interface ResumeExtractionError {
  success: false;
  error: string;
}

export type ResumeExtractionResponse =
  | ResumeExtractionResult
  | ResumeExtractionError;

export async function extractResumeData(
  options: ResumeExtractionOptions
): Promise<ResumeExtractionResponse> {
  const { resumeText, hints } = options;

  // Validate input
  if (!resumeText || resumeText.trim().length < 50) {
    return {
      success: false,
      error: "Resume text is too short. Please provide a complete resume.",
    };
  }

  const prompt = buildExtractionPrompt(resumeText, hints);

  try {
    const { output } = await generateText({
      model: MODEL,
      output: Output.object({
        schema: ResumeExtractionSchema,
      }),
      system: RESUME_EXTRACTION_SYSTEM_PROMPT,
      prompt,
    });

    return {
      success: true,
      data: output,
    };
  } catch (error) {
    console.error("[ResumeExtractor] Extraction failed:", error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to extract resume data. Please try again.",
    };
  }
}

/**
 * Builds the extraction prompt with optional hints
 */
function buildExtractionPrompt(resumeText: string, hints?: string): string {
  let prompt = `Extract all structured data from the following resume.

RESUME TEXT:
---
${resumeText}
---`;

  if (hints) {
    prompt += `

ADDITIONAL CONTEXT:
${hints}`;
  }

  prompt += `

Extract all information into the structured format. Be thorough and accurate.`;

  return prompt;
}

/**
 * Helper to convert extracted dates to JavaScript Date objects
 * Use this when saving to database
 */
export function parseExtractedDate(dateString: string | null): Date | null {
  if (!dateString) return null;

  // Handle YYYY-MM format
  if (/^\d{4}-\d{2}$/.test(dateString)) {
    return new Date(`${dateString}-01`);
  }

  // Handle YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return new Date(dateString);
  }

  // Try parsing as-is
  const parsed = new Date(dateString);
  return isNaN(parsed.getTime()) ? null : parsed;
}
