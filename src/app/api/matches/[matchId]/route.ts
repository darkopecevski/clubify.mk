import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// PATCH /api/matches/[matchId] - Update a match
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
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
    const {
      away_team_name,
      match_date,
      start_time,
      location,
      competition,
      notes,
      status,
    } = body;

    // Get match with team info
    const { data: match } = await supabase
      .from("matches")
      .select(
        `
        id,
        home_team_id,
        status,
        teams:home_team_id (
          id,
          club_id
        )
      `
      )
      .eq("id", matchId)
      .single();

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const clubId = (match.teams as { club_id: string }).club_id;

    // Check access based on role
    const isSuperAdmin = roles.some((r) => r.role === "super_admin");
    const isClubAdmin = roles.some(
      (r) => r.role === "club_admin" && r.club_id === clubId
    );

    let isCoach = false;
    if (roles.some((r) => r.role === "coach")) {
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
          .eq("team_id", match.home_team_id)
          .eq("is_active", true)
          .maybeSingle();

        isCoach = !!assignment;
      }
    }

    if (!isSuperAdmin && !isClubAdmin && !isCoach) {
      return NextResponse.json(
        { error: "You do not have access to this match" },
        { status: 403 }
      );
    }

    // Build update object (only update provided fields)
    const updateData: Record<string, unknown> = {};
    if (away_team_name !== undefined) updateData.away_team_name = away_team_name;
    if (match_date !== undefined) updateData.match_date = match_date;
    if (start_time !== undefined) updateData.start_time = start_time;
    if (location !== undefined) updateData.location = location;
    if (competition !== undefined) updateData.competition = competition || null;
    if (notes !== undefined) updateData.notes = notes || null;
    if (status !== undefined) updateData.status = status;

    // Update the match
    const { data: updatedMatch, error: updateError } = await supabase
      .from("matches")
      .update(updateData)
      .eq("id", matchId)
      .select()
      .single();

    if (updateError) {
      console.error("Match update error:", updateError);
      throw new Error(`Failed to update match: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      match: updatedMatch,
    });
  } catch (error) {
    console.error("Error updating match:", error);

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

// DELETE /api/matches/[matchId] - Cancel a match (set status to cancelled)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
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

    // Get match with team info
    const { data: match } = await supabase
      .from("matches")
      .select(
        `
        id,
        home_team_id,
        teams:home_team_id (
          id,
          club_id
        )
      `
      )
      .eq("id", matchId)
      .single();

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const clubId = (match.teams as { club_id: string }).club_id;

    // Check access based on role
    const isSuperAdmin = roles.some((r) => r.role === "super_admin");
    const isClubAdmin = roles.some(
      (r) => r.role === "club_admin" && r.club_id === clubId
    );

    let isCoach = false;
    if (roles.some((r) => r.role === "coach")) {
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
          .eq("team_id", match.home_team_id)
          .eq("is_active", true)
          .maybeSingle();

        isCoach = !!assignment;
      }
    }

    if (!isSuperAdmin && !isClubAdmin && !isCoach) {
      return NextResponse.json(
        { error: "You do not have access to this match" },
        { status: 403 }
      );
    }

    // Cancel the match (soft delete by setting status)
    const { error: cancelError } = await supabase
      .from("matches")
      .update({ status: "cancelled" })
      .eq("id", matchId);

    if (cancelError) {
      console.error("Match cancel error:", cancelError);
      throw new Error(`Failed to cancel match: ${cancelError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: "Match cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling match:", error);

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
