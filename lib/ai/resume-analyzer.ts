import { generateText, Output } from "ai";
import {
  ResumeAnalysisOutputSchema,
  type ResumeAnalysisInput,
} from "@/lib/validations/resume-analysis";

const RESUME_ANALYSIS_SYSTEM_PROMPT = `You are a resume reviewer. Analyze the resume against the job description.

## Output Requirements

### Score (0-100)
- scoreLabel: "Poor" (<40), "Fair" (40-59), "Good" (60-74), "Strong" (75-89), "Excellent" (90+)
- scoreSummary: One direct sentence. No fluff.

### Missing Keywords
All important terms from the job posting not found in the resume.
- keyword: Exact term from job posting
- category: Classify each keyword:
  * "Hard Skill": Learnable, measurable abilities - tools, languages, frameworks, methodologies, technical skills (e.g., Docker, Python, Excel, Accounting, Data Analysis)
  * "Soft Skill": Interpersonal abilities (e.g., Leadership, Communication, Collaboration, Problem-solving)
  * "Domain": Industry knowledge, certifications, specific experience (e.g., HIPAA, Series 7, Supply Chain)
- importance: "Critical" (required), "Important" (preferred), "Nice to Have" (bonus)
- whereToAdd: Specific section or role, e.g., "Skills section" or "Your role at Acme Corp"

### Bullet Fixes
Find all weak bullet points from the resume and suggest rewrites. If all bullets are strong, return an empty array.
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

### Priority Actions (1-3 items)
Only include actions that are genuinely impactful. Don't pad with generic advice.
Examples:
- Good: "Add Docker to Skills - listed as required"
- Bad: "Quantify your achievements"

### Section Feedback (exactly 5 sections)
Check these sections: Contact, Summary, Experience, Education, Skills
For each:
- status: "Present", "Missing", or "Incomplete"
- feedback: If Missing or Incomplete, explain what's needed. If Present, say "Complete" or note minor issues.

Examples:
- Summary Missing: "Add a 2-3 sentence summary highlighting your fit for this role"
- Education Incomplete: "Add graduation dates"
- Skills Present: "Complete"

### Length Assessment
The resume page count will be provided in the prompt (if uploaded as PDF). Use this actual page count for assessment.

Guidelines by experience level:
- Entry-level (0-2 years): 1 page ideal
- Mid-level (3-7 years): 1-2 pages
- Senior (8+ years): 2 pages acceptable

Provide:
- currentLength: "Too Short", "Appropriate", or "Too Long"
- recommendation: Specific advice using the actual page count, e.g., "At 3 pages, this is too long for a mid-level role. Cut to 2 pages by removing older positions."

## Writing Style
- Direct and concise
- No filler phrases ("I'd recommend", "You might consider", "It would be beneficial")
- No exclamation marks
- State facts, not opinions`;

const MODEL = "google/gemini-2.5-flash-lite";

/**
 * Analyzes a resume against a job description using AI
 * Returns a structured object response
 */
export async function analyzeResume({
  resumeText,
  jobDescription,
  pageCount,
}: ResumeAnalysisInput) {
  const pageCountInfo = pageCount
    ? `\nRESUME PAGE COUNT: ${pageCount} page${pageCount > 1 ? "s" : ""}`
    : "";

  const prompt = `Analyze this resume against the job description.

RESUME:
${resumeText}
${pageCountInfo}
JOB DESCRIPTION:
${jobDescription}`;

  const { output } = await generateText({
    model: MODEL,
    output: Output.object({
      schema: ResumeAnalysisOutputSchema,
    }),
    system: RESUME_ANALYSIS_SYSTEM_PROMPT,
    prompt,
  });

  return output;
}
