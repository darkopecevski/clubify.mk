import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/coach/training/[sessionId] - Update a training session
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

    // Update the training session
    const { data: updatedSession, error: updateError } = await supabase
      .from("training_sessions")
      .update({
        team_id,
        session_date,
        start_time,
        duration_minutes,
        location: location || null,
        notes: notes || null,
      })
      .eq("id", sessionId)
      .select()
      .single();

    if (updateError) {
      console.error("Training session update error:", updateError);
      throw new Error(
        `Failed to update training session: ${updateError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      session: updatedSession,
    });
  } catch (error) {
    console.error("Error updating training session:", error);

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

// DELETE /api/coach/training/[sessionId] - Delete a training session
export async function DELETE(
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

    // Get delete_mode from request body
    const body = await request.json().catch(() => ({}));
    const { delete_mode = "single" } = body as {
      delete_mode?: "single" | "all_future";
    };

    // Get training session with team info and recurrence info
    const { data: session } = await supabase
      .from("training_sessions")
      .select(
        `
        id,
        team_id,
        session_date,
        recurrence_id,
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

    // Handle delete based on mode
    if (delete_mode === "all_future" && session.recurrence_id) {
      // Get the recurrence pattern details to find all related patterns
      const { data: recurrencePattern } = await supabase
        .from("training_recurrences")
        .select("team_id, start_time, duration_minutes, location")
        .eq("id", session.recurrence_id)
        .single();

      if (recurrencePattern) {
        // Find all recurrence patterns with same team, time, duration, and location
        // This represents the complete recurring pattern (e.g., Mon/Wed/Fri)
        let query = supabase
          .from("training_recurrences")
          .select("id")
          .eq("team_id", recurrencePattern.team_id)
          .eq("start_time", recurrencePattern.start_time)
          .eq("duration_minutes", recurrencePattern.duration_minutes);

        // Handle location comparison (NULL vs value)
        if (recurrencePattern.location) {
          query = query.eq("location", recurrencePattern.location);
        } else {
          query = query.is("location", null);
        }

        const { data: allPatterns } = await query;

        if (allPatterns && allPatterns.length > 0) {
          const allPatternIds = allPatterns.map((p) => p.id);

          // Delete all future sessions for ALL patterns in this group
          const { error: futureSessionsDeleteError } = await supabase
            .from("training_sessions")
            .delete()
            .in("recurrence_id", allPatternIds)
            .gte("session_date", session.session_date);

          if (futureSessionsDeleteError) {
            console.error(
              "Future sessions delete error:",
              futureSessionsDeleteError
            );
            throw new Error(
              `Failed to delete future sessions: ${futureSessionsDeleteError.message}`
            );
          }

          // Delete all the recurring patterns
          const { error: patternDeleteError } = await supabase
            .from("training_recurrences")
            .delete()
            .in("id", allPatternIds);

          if (patternDeleteError) {
            console.error("Pattern delete error:", patternDeleteError);
            throw new Error(
              `Failed to delete recurring patterns: ${patternDeleteError.message}`
            );
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: "Recurring pattern and all future sessions deleted successfully",
      });
    } else {
      // Delete only this session
      const { error: deleteError } = await supabase
        .from("training_sessions")
        .delete()
        .eq("id", sessionId);

      if (deleteError) {
        console.error("Training session delete error:", deleteError);
        throw new Error(
          `Failed to delete training session: ${deleteError.message}`
        );
      }

      return NextResponse.json({
        success: true,
        message: "Training session deleted successfully",
      });
    }
  } catch (error) {
    console.error("Error deleting training session:", error);

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
