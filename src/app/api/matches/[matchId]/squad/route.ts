import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/matches/[matchId]/squad - Get squad for a match
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

    // Get match to verify access
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

    // Check user has access to this match
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id);

    const isSuperAdmin = roles?.some((r) => r.role === "super_admin");
    const isClubAdmin = roles?.some(
      (r) => r.role === "club_admin" && r.club_id === match.teams?.club_id
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
          .eq("team_id", match.home_team_id)
          .eq("is_active", true)
          .single();

        isCoach = !!assignment;
      }
    }

    if (!isSuperAdmin && !isClubAdmin && !isCoach) {
      return NextResponse.json(
        { error: "You do not have access to this match" },
        { status: 403 }
      );
    }

    // Get squad
    const { data: squad } = await supabase
      .from("match_squads")
      .select(
        `
        id,
        match_id,
        player_id,
        is_starting,
        jersey_number,
        position,
        notes,
        players:player_id (
          id,
          first_name,
          last_name,
          position
        )
      `
      )
      .eq("match_id", matchId)
      .order("is_starting", { ascending: false })
      .order("jersey_number", { ascending: true });

    return NextResponse.json({ squad: squad || [] });
  } catch (error) {
    console.error("Error fetching match squad:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/matches/[matchId]/squad - Save squad for a match
export async function POST(
  request: Request,
  { params }: { params: Promise<{ matchId: string }> }
) {
  try {
    const { matchId } = await params;
    const supabase = await createClient();
    const body = await request.json();
    const { squad } = body; // Array of { player_id, is_starting, jersey_number?, position?, notes? }

    if (!squad || !Array.isArray(squad)) {
      return NextResponse.json(
        { error: "Squad data is required" },
        { status: 400 }
      );
    }

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get match to verify access
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

    // Check user has access to manage this match
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id);

    const isSuperAdmin = roles?.some((r) => r.role === "super_admin");
    const isClubAdmin = roles?.some(
      (r) => r.role === "club_admin" && r.club_id === match.teams?.club_id
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
          .eq("team_id", match.home_team_id)
          .eq("is_active", true)
          .single();

        isCoach = !!assignment;
      }
    }

    if (!isSuperAdmin && !isClubAdmin && !isCoach) {
      return NextResponse.json(
        { error: "You do not have access to manage this match" },
        { status: 403 }
      );
    }

    // Delete existing squad
    await supabase.from("match_squads").delete().eq("match_id", matchId);

    // Insert new squad
    if (squad.length > 0) {
      const squadData = squad.map((s: {
        player_id: string;
        is_starting: boolean;
        jersey_number?: number;
        position?: string;
        notes?: string;
      }) => ({
        match_id: matchId,
        player_id: s.player_id,
        is_starting: s.is_starting,
        jersey_number: s.jersey_number || null,
        position: s.position || null,
        notes: s.notes || null,
      }));

      const { error: insertError } = await supabase
        .from("match_squads")
        .insert(squadData);

      if (insertError) {
        console.error("Error inserting squad:", insertError);
        return NextResponse.json(
          { error: "Failed to save squad" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving match squad:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
