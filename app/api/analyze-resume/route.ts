import { NextResponse } from "next/server";

import { analyzeResume } from "@/lib/ai";
import { checkAuth } from "@/lib/auth-check";
import { ResumeAnalysisSchema } from "@/lib/validations/resume-analysis";

export async function POST(req: Request) {
  try {
    const auth = await checkAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validation = ResumeAnalysisSchema.safeParse(body);
    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      return NextResponse.json({ error: firstIssue.message }, { status: 400 });
    }

    const { resumeText, jobDescription, pageCount } = validation.data;
    const result = await analyzeResume({
      resumeText,
      jobDescription,
      pageCount,
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}
