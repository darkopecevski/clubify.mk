import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// DELETE /api/club/team-players/[teamPlayerId] - Remove player from team
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamPlayerId: string }> }
) {
  try {
    const { teamPlayerId } = await params;
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

    // Get team-player assignment to check access
    const { data: teamPlayer } = await supabase
      .from("team_players")
      .select(`
        id,
        team_id,
        player_id,
        teams!inner (
          id,
          club_id
        )
      `)
      .eq("id", teamPlayerId)
      .single();

    if (!teamPlayer) {
      return NextResponse.json(
        { error: "Team assignment not found" },
        { status: 404 }
      );
    }

    const clubId = (teamPlayer.teams as { club_id: string }).club_id;

    // Validate club access
    const hasAccess =
      roles.some((r) => r.role === "super_admin") ||
      roles.some((r) => r.role === "club_admin" && r.club_id === clubId) ||
      roles.some((r) => r.role === "coach" && r.club_id === clubId);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "You do not have access to this team" },
        { status: 403 }
      );
    }

    const adminSupabase = createAdminClient();

    // Delete the team-player assignment
    const { error: deleteError } = await adminSupabase
      .from("team_players")
      .delete()
      .eq("id", teamPlayerId);

    if (deleteError) {
      console.error("Team player delete error:", deleteError);
      throw new Error(
        `Failed to remove player from team: ${deleteError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Player removed from team successfully",
    });
  } catch (error) {
    console.error("Error removing player from team:", error);

    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "object" && error !== null) {
      const err = error as { message?: string; error_description?: string };
      errorMessage =
        err.message || err.error_description || JSON.stringify(error);
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
