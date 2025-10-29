import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/coach/training/[sessionId]/notes - Update training session notes
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check user roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "club_admin", "coach"]);

    if (!roles || roles.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { notes } = body;

    // Get training session with team info
    const { data: session } = await supabase
      .from("training_sessions")
      .select(
        `
        id,
        team_id,
        teams:team_id (
          id,
          club_id
        )
      `
      )
      .eq("id", sessionId)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: "Training session not found" },
        { status: 404 }
      );
    }

    const clubId = (session.teams as { club_id: string }).club_id;

    // Check access based on role
    const isSuperAdmin = roles.some((r) => r.role === "super_admin");
    const isClubAdmin = roles.some(
      (r) => r.role === "club_admin" && r.club_id === clubId
    );

    let isCoach = false;
    if (roles.some((r) => r.role === "coach")) {
      // Check if coach is assigned to this team
      const { data: coach } = await supabase
        .from("coaches")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (coach) {
        const { data: assignment } = await supabase
          .from("team_coaches")
          .select("id")
          .eq("coach_id", coach.id)
          .eq("team_id", session.team_id)
          .eq("is_active", true)
          .maybeSingle();

        isCoach = !!assignment;
      }
    }

    if (!isSuperAdmin && !isClubAdmin && !isCoach) {
      return NextResponse.json(
        { error: "You do not have access to this training session" },
        { status: 403 }
      );
    }

    // Update the training session notes
    const { data: updatedSession, error: updateError } = await supabase
      .from("training_sessions")
      .update({
        notes: notes || null,
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (updateError) {
      console.error("Training session notes update error:", updateError);
      throw new Error(
        `Failed to update training session notes: ${updateError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      session: updatedSession,
    });
  } catch (error) {
    console.error("Error updating training session notes:", error);

    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
