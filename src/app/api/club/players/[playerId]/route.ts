import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/club/players/[playerId] - Get player details
export async function GET(
  request: Request,
  { params }: { params: Promise<{ playerId: string }> }
) {
  try {
    const { playerId } = await params;
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
      .eq("user_id", user.id);

    const isSuperAdmin = roles?.some((r) => r.role === "super_admin");

    // Get player with all related data
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select(
        `
        *,
        player_parents (
          parent_user_id,
          relationship,
          users:parent_user_id (
            id,
            full_name
          )
        )
      `
      )
      .eq("id", playerId)
      .single();

    if (playerError) {
      console.error("Error fetching player:", playerError);
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    // Check access permissions
    let hasAccess = isSuperAdmin;

    if (!hasAccess) {
      // Check if user is club admin for this player's club
      const isClubAdmin = roles?.some(
        (r) => r.role === "club_admin" && r.club_id === player.club_id
      );
      hasAccess = isClubAdmin;
    }

    if (!hasAccess) {
      // Check if user is a coach for any of the player's teams
      const { data: coach } = await supabase
        .from("coaches")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (coach) {
        // Get player's teams
        const { data: playerTeams } = await supabase
          .from("team_players")
          .select("team_id")
          .eq("player_id", playerId);

        if (playerTeams && playerTeams.length > 0) {
          const teamIds = playerTeams.map((t) => t.team_id);

          // Check if coach is assigned to any of these teams
          const { data: coachTeams } = await supabase
            .from("team_coaches")
            .select("team_id")
            .eq("coach_id", coach.id)
            .eq("is_active", true)
            .in("team_id", teamIds);

          hasAccess = !!(coachTeams && coachTeams.length > 0);
        }
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have permission to view this player" },
        { status: 403 }
      );
    }

    // Get player's teams with details
    const { data: teamAssignments } = await supabase
      .from("team_players")
      .select(
        `
        id,
        jersey_number,
        joined_date,
        left_date,
        is_active,
        teams:team_id (
          id,
          name,
          age_group,
          season
        )
      `
      )
      .eq("player_id", playerId);

    // Transform parent data to get email from the RPC function
    const parentsWithEmails = await Promise.all(
      (player.player_parents || []).map(async (pp: { parent_user_id: string; relationship: string; users: { id: string; full_name: string } }) => {
        // Get email using RPC function
        const { data: usersWithEmail } = await supabase.rpc(
          "get_users_with_email"
        );

        const userWithEmail = usersWithEmail?.find(
          (u: { id: string; email: string }) => u.id === pp.parent_user_id
        );

        return {
          id: pp.parent_user_id,
          full_name: pp.users?.full_name,
          email: userWithEmail?.email,
          relationship: pp.relationship,
        };
      })
    );

    return NextResponse.json({
      player: {
        ...player,
        parents: parentsWithEmails,
        teams: teamAssignments || [],
      },
    });
  } catch (error) {
    console.error("Error in player detail route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
