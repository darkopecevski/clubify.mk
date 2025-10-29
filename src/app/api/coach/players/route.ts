import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/coach/players - Get players from coach's assigned teams
export async function GET() {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get coach record
    const { data: coach, error: coachError } = await supabase
      .from("coaches")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (coachError || !coach) {
      return NextResponse.json(
        { error: "Coach profile not found" },
        { status: 404 }
      );
    }

    // Get team IDs that the coach is assigned to
    const { data: teamAssignments, error: assignmentsError } = await supabase
      .from("team_coaches")
      .select("team_id")
      .eq("coach_id", coach.id)
      .eq("is_active", true);

    if (assignmentsError) {
      console.error("Error fetching team assignments:", assignmentsError);
      return NextResponse.json(
        { error: "Failed to fetch team assignments" },
        { status: 500 }
      );
    }

    const teamIds = teamAssignments?.map((t) => t.team_id) || [];

    if (teamIds.length === 0) {
      // Coach has no teams assigned
      return NextResponse.json({ players: [] });
    }

    // Get players from these teams
    const { data: teamPlayers, error: teamPlayersError } = await supabase
      .from("team_players")
      .select(
        `
        player_id,
        teams:team_id (
          id,
          name,
          age_group
        )
      `
      )
      .in("team_id", teamIds);

    if (teamPlayersError) {
      console.error("Error fetching team players:", teamPlayersError);
      return NextResponse.json(
        { error: "Failed to fetch team players" },
        { status: 500 }
      );
    }

    // Get unique player IDs
    const playerIds = [...new Set(teamPlayers?.map((tp) => tp.player_id) || [])];

    if (playerIds.length === 0) {
      return NextResponse.json({ players: [] });
    }

    // Fetch player details
    const { data: players, error: playersError } = await supabase
      .from("players")
      .select(
        `
        id,
        first_name,
        last_name,
        date_of_birth,
        gender,
        position,
        jersey_number,
        photo_url,
        is_active
      `
      )
      .in("id", playerIds)
      .order("first_name");

    if (playersError) {
      console.error("Error fetching players:", playersError);
      return NextResponse.json(
        { error: "Failed to fetch players" },
        { status: 500 }
      );
    }

    // Group teams by player
    const playersWithTeams = players?.map((player) => {
      const teams = teamPlayers
        ?.filter((tp) => tp.player_id === player.id)
        .map((tp) => tp.teams);

      return {
        ...player,
        teams: teams || [],
      };
    });

    return NextResponse.json({ players: playersWithTeams || [] });
  } catch (error) {
    console.error("Error in coach players route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
