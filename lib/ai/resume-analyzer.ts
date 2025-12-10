import { generateObject } from "ai";
import { ResumeAnalysisOutputSchema } from "@/lib/validations/resume-analysis";

const RESUME_ANALYSIS_SYSTEM_PROMPT = `You are a resume reviewer. Analyze the resume against the job description.

## Output Requirements

### Score (0-100)
- scoreLabel: "Poor" (<40), "Fair" (40-59), "Good" (60-74), "Strong" (75-89), "Excellent" (90+)
- scoreSummary: One direct sentence. No fluff.

### Missing Keywords
All important terms from the job posting not found in the resume.
- keyword: Exact term from job posting
- importance: "Critical" (required), "Important" (preferred), "Nice to Have" (bonus)
- whereToAdd: Specific section or role, e.g., "Skills section" or "Your role at Acme Corp"

### Bullet Fixes
Find all weak bullet points from the resume and suggest rewrites.
- location: e.g., "Experience → Acme Corp → 2nd bullet"
- original: Exact text from the resume (must match verbatim)
- improved: Rewritten with action verb, metrics, and relevance to job
- reason: Brief explanation referencing job requirements
- impact: "High" or "Medium"

Rules:
- original must be text that exists in the resume
- Target vague phrases: "Responsible for", "Worked on", "Helped with"
- Prioritize bullets that can incorporate missing keywords
- DO NOT use these overused words: Spearheaded, Leveraged, Synergy, Utilize, Facilitated, Orchestrated, Pioneered, Revolutionized, Streamlined, Championed
- Use plain, professional verbs: Led, Built, Created, Reduced, Increased, Managed, Designed, Developed, Improved, Launched

### Priority Actions (exactly 3)
Specific next steps. Examples:
- Good: "Add Docker to Skills - listed as required"
- Bad: "Quantify your achievements"

## Writing Style
- Direct and concise
- No filler phrases ("I'd recommend", "You might consider", "It would be beneficial")
- No exclamation marks
- State facts, not opinions`;

const MODEL = "google/gemini-2.5-flash-lite";

export interface ResumeAnalysisInput {
  resumeText: string;
  jobDescription: string;
}

/**
 * Analyzes a resume against a job description using AI
 * Returns a structured object response
 */
export async function analyzeResume({
  resumeText,
  jobDescription,
}: ResumeAnalysisInput) {
  const { object } = await generateObject({
    model: MODEL,
    schema: ResumeAnalysisOutputSchema,
    system: RESUME_ANALYSIS_SYSTEM_PROMPT,
    prompt: `Analyze this resume against the job description.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`,
  });

  return object;
}
