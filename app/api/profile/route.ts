import { NextRequest, NextResponse } from "next/server";
import { checkAuth } from "@/lib/auth-check";
import { updateProfile } from "@/lib/db/profile";
import { ProfileUpdateSchema } from "@/lib/validations/profile-update";

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await checkAuth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = ProfileUpdateSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Update profile
    const result = await updateProfile(session.user.id, validationResult.data);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profileId: result.profileId,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
