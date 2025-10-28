import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/coach/training - Create a training session
export async function POST(request: Request) {
  try {
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
    const { team_id, session_date, start_time, duration_minutes, location, notes } = body;

    // Validate required fields
    if (!team_id || !session_date || !start_time || !duration_minutes) {
      return NextResponse.json(
        { error: "Team, date, start time, and duration are required" },
        { status: 400 }
      );
    }

    // Validate duration
    if (duration_minutes <= 0) {
      return NextResponse.json(
        { error: "Duration must be greater than 0" },
        { status: 400 }
      );
    }

    // Get team to verify access
    const { data: team } = await supabase
      .from("teams")
      .select("id, club_id")
      .eq("id", team_id)
      .single();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check access based on role
    const isSuperAdmin = roles.some((r) => r.role === "super_admin");
    const isClubAdmin = roles.some(
      (r) => r.role === "club_admin" && r.club_id === team.club_id
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
          .eq("team_id", team_id)
          .eq("is_active", true)
          .maybeSingle();

        isCoach = !!assignment;
      }
    }

    if (!isSuperAdmin && !isClubAdmin && !isCoach) {
      return NextResponse.json(
        { error: "You do not have access to this team" },
        { status: 403 }
      );
    }

    // Create training session
    const { data: session, error: sessionError } = await supabase
      .from("training_sessions")
      .insert({
        team_id,
        session_date,
        start_time,
        duration_minutes,
        location: location || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (sessionError) {
      console.error("Training session create error:", sessionError);
      throw new Error(
        `Failed to create training session: ${sessionError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error("Error creating training session:", error);

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
