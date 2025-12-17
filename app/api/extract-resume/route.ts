import { NextResponse } from "next/server";
import { z } from "zod";

import { extractResumeData } from "@/lib/ai";
import { checkAuth } from "@/lib/auth-check";
import { saveExtractedProfile } from "@/lib/db/profile";

// ============================================================
// RESUME EXTRACTION API ENDPOINT
// POST /api/extract-resume
// Extracts structured data from resume text and saves to profile
// ============================================================

const ExtractResumeRequestSchema = z.object({
  resumeText: z
    .string()
    .min(50, "Resume text must be at least 50 characters")
    .max(100_000, "Resume text exceeds maximum length"),
  hints: z.string().optional(),
  saveToProfile: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    // 1. Check authentication
    const auth = await checkAuth();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse and validate request body
    const body = await req.json();
    const validation = ExtractResumeRequestSchema.safeParse(body);

    if (!validation.success) {
      const firstIssue = validation.error.issues[0];
      return NextResponse.json({ error: firstIssue.message }, { status: 400 });
    }

    const { resumeText, hints, saveToProfile } = validation.data;

    // 3. Extract structured data using AI
    const extractionResult = await extractResumeData({ resumeText, hints });

    if (!extractionResult.success) {
      return NextResponse.json(
        { error: extractionResult.error },
        { status: 422 }
      );
    }

    // 4. Optionally save to user profile
    let profileId: string | null = null;

    if (saveToProfile) {
      const saveResult = await saveExtractedProfile(
        auth.user.id,
        extractionResult.data
      );

      if (!saveResult.success) {
        // Return extracted data even if save fails
        return NextResponse.json(
          {
            data: extractionResult.data,
            saved: false,
            saveError: saveResult.error,
          },
          { status: 207 } // Multi-Status: extraction succeeded, save failed
        );
      }

      profileId = saveResult.profileId;
    }

    // 5. Return success response
    return NextResponse.json({
      data: extractionResult.data,
      saved: saveToProfile,
      profileId,
    });
  } catch (error) {
    console.error("[API] Resume extraction error:", error);

    return NextResponse.json(
      { error: "Failed to extract resume data. Please try again." },
      { status: 500 }
    );
  }
}
