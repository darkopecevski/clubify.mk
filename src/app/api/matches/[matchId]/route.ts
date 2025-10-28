import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/matches/[matchId] - Get single match details
export async function GET(
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

    // Fetch match with team details
    const { data: match, error } = await supabase
      .from("matches")
      .select(
        `
        id,
        home_team_id,
        away_team_id,
        away_team_name,
        match_date,
        start_time,
        location,
        competition,
        status,
        home_score,
        away_score,
        notes,
        created_at,
        teams:home_team_id (
          id,
          name,
          age_group,
          clubs:club_id (
            id,
            name
          )
        )
      `
      )
      .eq("id", matchId)
      .single();

    if (error || !match) {
      console.error("Error fetching match:", error);
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Check if user has access to this match
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id);

    const isSuperAdmin = roles?.some((r) => r.role === "super_admin");

    // Get the club_id from the team
    const clubId = match.teams?.clubs?.id;

    if (!isSuperAdmin) {
      const isClubAdmin = roles?.some(
        (r) => r.role === "club_admin" && r.club_id === clubId
      );

      let isCoach = false;
      if (!isClubAdmin) {
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
            .single();

          isCoach = !!assignment;
        }
      }

      if (!isClubAdmin && !isCoach) {
        return NextResponse.json(
          { error: "You do not have access to this match" },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error("Error in match route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH /api/matches/[matchId] - Update match
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      away_team_name,
      match_date,
      start_time,
      location,
      competition,
      home_score,
      away_score,
      notes,
      status,
    } = body;

    // Get match to check permissions
    const { data: existingMatch } = await supabase
      .from("matches")
      .select(
        `
        id,
        home_team_id,
        teams:home_team_id (
          clubs:club_id (
            id
          )
        )
      `
      )
      .eq("id", matchId)
      .single();

    if (!existingMatch) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Check permissions
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id);

    const isSuperAdmin = roles?.some((r) => r.role === "super_admin");
    const clubId = existingMatch.teams?.clubs?.id;
    const isClubAdmin = roles?.some(
      (r) => r.role === "club_admin" && r.club_id === clubId
    );

    let isCoach = false;
    if (!isSuperAdmin && !isClubAdmin) {
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
          .eq("team_id", existingMatch.home_team_id)
          .eq("is_active", true)
          .single();

        isCoach = !!assignment;
      }
    }

    if (!isSuperAdmin && !isClubAdmin && !isCoach) {
      return NextResponse.json(
        { error: "You do not have permission to update this match" },
        { status: 403 }
      );
    }

    // Update match
    const { data: match, error } = await supabase
      .from("matches")
      .update({
        away_team_name,
        match_date,
        start_time,
        location,
        competition: competition || null,
        home_score: home_score !== undefined ? home_score : null,
        away_score: away_score !== undefined ? away_score : null,
        notes: notes || null,
        status: status || "scheduled",
      })
      .eq("id", matchId)
      .select()
      .single();

    if (error) {
      console.error("Error updating match:", error);
      return NextResponse.json(
        { error: "Failed to update match" },
        { status: 500 }
      );
    }

    return NextResponse.json({ match });
  } catch (error) {
    console.error("Error in update match route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/matches/[matchId] - Cancel match (soft delete)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get match to check permissions
    const { data: existingMatch } = await supabase
      .from("matches")
      .select(
        `
        id,
        home_team_id,
        teams:home_team_id (
          clubs:club_id (
            id
          )
        )
      `
      )
      .eq("id", matchId)
      .single();

    if (!existingMatch) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Check permissions
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id);

    const isSuperAdmin = roles?.some((r) => r.role === "super_admin");
    const clubId = existingMatch.teams?.clubs?.id;
    const isClubAdmin = roles?.some(
      (r) => r.role === "club_admin" && r.club_id === clubId
    );

    let isCoach = false;
    if (!isSuperAdmin && !isClubAdmin) {
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
          .eq("team_id", existingMatch.home_team_id)
          .eq("is_active", true)
          .single();

        isCoach = !!assignment;
      }
    }

    if (!isSuperAdmin && !isClubAdmin && !isCoach) {
      return NextResponse.json(
        { error: "You do not have permission to cancel this match" },
        { status: 403 }
      );
    }

    // Soft delete - set status to cancelled
    const { error } = await supabase
      .from("matches")
      .update({ status: "cancelled" })
      .eq("id", matchId);

    if (error) {
      console.error("Error cancelling match:", error);
      return NextResponse.json(
        { error: "Failed to cancel match" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in cancel match route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
