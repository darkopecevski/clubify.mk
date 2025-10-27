import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

// PATCH /api/club/team-players/[teamPlayerId] - Update jersey number
export async function PATCH(
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

    const body = await request.json();
    const { jersey_number } = body;

    // Validate jersey number
    if (
      jersey_number !== null &&
      (typeof jersey_number !== "number" ||
        jersey_number < 1 ||
        jersey_number > 99)
    ) {
      return NextResponse.json(
        { error: "Jersey number must be between 1 and 99" },
        { status: 400 }
      );
    }

    // Check for duplicates if jersey number is provided
    if (jersey_number !== null) {
      const { data: duplicate } = await supabase
        .from("team_players")
        .select("id")
        .eq("team_id", teamPlayer.team_id)
        .eq("jersey_number", jersey_number)
        .neq("id", teamPlayerId)
        .maybeSingle();

      if (duplicate) {
        return NextResponse.json(
          { error: "Jersey number is already in use by another player" },
          { status: 400 }
        );
      }
    }

    const adminSupabase = createAdminClient();

    // Update the jersey number
    const { error: updateError } = await adminSupabase
      .from("team_players")
      .update({ jersey_number })
      .eq("id", teamPlayerId);

    if (updateError) {
      console.error("Team player update error:", updateError);
      throw new Error(
        `Failed to update jersey number: ${updateError.message}`
      );
    }

    return NextResponse.json({
      success: true,
      message: "Jersey number updated successfully",
    });
  } catch (error) {
    console.error("Error updating jersey number:", error);

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
