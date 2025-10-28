import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/teams/[teamId]/players - Get players for a team (accessible by coaches and admins)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> }
) {
  try {
    const { teamId } = await params;
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get team to verify it exists and get club_id
    const { data: team } = await supabase
      .from("teams")
      .select("id, club_id")
      .eq("id", teamId)
      .single();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Check user has access to this team
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id);

    const isSuperAdmin = roles?.some((r) => r.role === "super_admin");
    const isClubAdmin = roles?.some(
      (r) => r.role === "club_admin" && r.club_id === team.club_id
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
          .eq("team_id", teamId)
          .eq("is_active", true)
          .single();

        isCoach = !!assignment;
      }
    }

    if (!isSuperAdmin && !isClubAdmin && !isCoach) {
      return NextResponse.json(
        { error: "You do not have access to this team" },
        { status: 403 }
      );
    }

    // Fetch team players
    const { data: teamPlayers, error } = await supabase
      .from("team_players")
      .select(
        `
        id,
        team_id,
        player_id,
        joined_at,
        left_at,
        players:player_id (
          id,
          first_name,
          last_name,
          position,
          is_active
        )
      `
      )
      .eq("team_id", teamId)
      .is("left_at", null);

    if (error) {
      console.error("Error fetching team players:", error);
      return NextResponse.json(
        { error: "Failed to fetch players" },
        { status: 500 }
      );
    }

    return NextResponse.json({ players: teamPlayers || [] });
  } catch (error) {
    console.error("Error in team players route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
