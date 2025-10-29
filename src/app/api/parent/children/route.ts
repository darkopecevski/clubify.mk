import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/parent/children - Get all children for authenticated parent
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

    // Check if user has parent role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "parent");

    if (!roles || roles.length === 0) {
      return NextResponse.json({ error: "Forbidden - Parent role required" }, { status: 403 });
    }

    // Get all children linked to this parent
    const { data: playerParents, error: playerParentsError } = await supabase
      .from("player_parents")
      .select(
        `
        player_id,
        relationship,
        players:player_id (
          id,
          first_name,
          last_name,
          date_of_birth,
          gender,
          photo_url,
          is_active,
          club_id,
          clubs:club_id (
            id,
            name
          )
        )
      `
      )
      .eq("parent_user_id", user.id);

    if (playerParentsError) {
      console.error("Error fetching player parents:", playerParentsError);
      return NextResponse.json(
        { error: "Failed to fetch children" },
        { status: 500 }
      );
    }

    if (!playerParents || playerParents.length === 0) {
      return NextResponse.json({ children: [] });
    }

    // Get team assignments for all children
    const playerIds = playerParents.map((pp) => pp.player_id);
    const { data: teamAssignments } = await supabase
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
      .in("player_id", playerIds)
      .is("left_date", null); // Only active team assignments

    // Group teams by player
    const playerTeamsMap: Record<string, Array<{ id: string; name: string; age_group: string | null }>> = {};
    teamAssignments?.forEach((assignment: { player_id: string; teams: { id: string; name: string; age_group: string | null } }) => {
      if (!playerTeamsMap[assignment.player_id]) {
        playerTeamsMap[assignment.player_id] = [];
      }
      playerTeamsMap[assignment.player_id].push(assignment.teams);
    });

    // Format response
    const children = playerParents.map((pp) => {
      const player = pp.players as {
        id: string;
        first_name: string;
        last_name: string;
        date_of_birth: string;
        gender: string;
        photo_url: string | null;
        is_active: boolean;
        club_id: string;
        clubs: { id: string; name: string } | null;
      };

      return {
        id: player.id,
        first_name: player.first_name,
        last_name: player.last_name,
        date_of_birth: player.date_of_birth,
        gender: player.gender,
        photo_url: player.photo_url,
        is_active: player.is_active,
        relationship: pp.relationship,
        club: player.clubs,
        teams: playerTeamsMap[player.id] || [],
      };
    });

    return NextResponse.json({ children });
  } catch (error) {
    console.error("Error in /api/parent/children:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
