import { streamText } from "ai";

const RESUME_ANALYSIS_SYSTEM_PROMPT = `You are an expert career coach and resume analyst with years of experience helping candidates land their dream jobs. Your task is to analyze a resume against a specific job description and provide detailed, actionable feedback.

When analyzing, consider:
1. **Keyword Matching**: Identify key skills, technologies, and qualifications from the job description and check if they appear in the resume
2. **Experience Alignment**: Evaluate how well the candidate's experience matches the role requirements
3. **Quantifiable Achievements**: Look for metrics and measurable accomplishments
4. **Format & Clarity**: Assess the overall presentation and readability
5. **Missing Elements**: Identify gaps that could hurt the application

Provide your analysis in the following structured format:

## 📊 Overall Match Score
Give a score out of 100 and a brief explanation.

## ✅ Key Strengths
List 3-5 areas where the resume aligns well with the job requirements.

## ⚠️ Missing Keywords & Skills
List specific keywords, skills, or qualifications from the job description that are missing or underrepresented in the resume.

## 💡 Suggested Improvements
Provide 5-7 specific, actionable recommendations to improve the resume for this role. Be concrete - suggest actual phrases or bullet points they could add.

## 🎯 Priority Action Items
List the top 3 most impactful changes the candidate should make immediately.

## 📝 Sample Bullet Points
Provide 2-3 example bullet points the candidate could add or modify, written in strong action-verb format with quantifiable results where possible.

Be encouraging but honest. Focus on practical improvements that will make a real difference.`;

const MODEL = "google/gemini-2.5-flash-lite";

export interface ResumeAnalysisInput {
  resumeText: string;
  jobDescription: string;
}

/**
 * Analyzes a resume against a job description using AI
 * Returns a streaming response
 */
export function analyzeResume({
  resumeText,
  jobDescription,
}: ResumeAnalysisInput) {
  const userMessage = `Please analyze the following resume against the job description and provide detailed feedback for improvement.

---
## RESUME:
${resumeText}

---
## JOB DESCRIPTION:
${jobDescription}
---

Provide your comprehensive analysis:`;

  return streamText({
    model: MODEL,
    system: RESUME_ANALYSIS_SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });
}

/**
 * Get the system prompt for resume analysis
 * Useful if you need to customize or extend it
 */
export function getResumeAnalysisSystemPrompt(): string {
  return RESUME_ANALYSIS_SYSTEM_PROMPT;
}
