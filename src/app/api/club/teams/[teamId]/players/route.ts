import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// POST /api/club/teams/[teamId]/players - Assign player to team
export async function POST(
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

    // Check if user has club_admin or coach role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "club_admin", "coach"]);

    if (!roles || roles.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { player_id } = body;

    if (!player_id) {
      return NextResponse.json(
        { error: "player_id is required" },
        { status: 400 }
      );
    }

    // Get team to check club access
    const { data: team } = await supabase
      .from("teams")
      .select("club_id")
      .eq("id", teamId)
      .single();

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Get player to check club
    const { data: player } = await supabase
      .from("players")
      .select("club_id")
      .eq("id", player_id)
      .single();

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Validate club access
    const hasAccess =
      roles.some((r) => r.role === "super_admin") ||
      roles.some((r) => r.role === "club_admin" && r.club_id === team.club_id) ||
      roles.some((r) => r.role === "coach" && r.club_id === team.club_id);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have access to this team" },
        { status: 403 }
      );
    }

    // Ensure player is in the same club as team
    if (player.club_id !== team.club_id) {
      return NextResponse.json(
        { error: "Player and team must be in the same club" },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminClient();

    // Check if assignment already exists
    const { data: existing } = await adminSupabase
      .from("team_players")
      .select("id")
      .eq("team_id", teamId)
      .eq("player_id", player_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Player is already assigned to this team" },
        { status: 400 }
      );
    }

    // Create team-player assignment
    const { data: assignment, error: assignError } = await adminSupabase
      .from("team_players")
      .insert({
        team_id: teamId,
        player_id: player_id,
        joined_at: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (assignError) {
      console.error("Team assignment error:", assignError);
      throw new Error(`Failed to assign player to team: ${assignError.message}`);
    }

    return NextResponse.json({
      success: true,
      assignment,
      message: "Player assigned to team successfully",
    });
  } catch (error) {
    console.error("Error assigning player to team:", error);

    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "object" && error !== null) {
      const err = error as { message?: string; error_description?: string };
      errorMessage = err.message || err.error_description || JSON.stringify(error);
    } else {
      errorMessage = String(error);
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
