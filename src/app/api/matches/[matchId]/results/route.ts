import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type PlayerStat = {
  player_id: string;
  goals?: number;
  assists?: number;
  yellow_cards?: number;
  red_cards?: number;
  saves?: number;
  shots_on_target?: number;
  passes_completed?: number;
  rating?: number;
  notes?: string;
};

// GET /api/matches/[matchId]/results - Get match results and statistics
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

    // Fetch match statistics with player details
    const { data: statistics, error } = await supabase
      .from("match_statistics")
      .select(
        `
        id,
        match_id,
        player_id,
        goals,
        assists,
        yellow_cards,
        red_cards,
        saves,
        shots_on_target,
        passes_completed,
        rating,
        notes,
        players:player_id (
          id,
          first_name,
          last_name
        )
      `
      )
      .eq("match_id", matchId);

    if (error) {
      console.error("Error fetching match statistics:", error);
      return NextResponse.json(
        { error: "Failed to fetch match statistics" },
        { status: 500 }
      );
    }

    return NextResponse.json({ statistics: statistics || [] });
  } catch (error) {
    console.error("Error in match results route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/matches/[matchId]/results - Save match results and player statistics
export async function POST(
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
    const { home_score, away_score, player_stats } = body;

    // Get match to check permissions
    const { data: match } = await supabase
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

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Check permissions
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id);

    const isSuperAdmin = roles?.some((r) => r.role === "super_admin");
    const clubId = match.teams?.clubs?.id;
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
          .eq("team_id", match.home_team_id)
          .eq("is_active", true)
          .single();

        isCoach = !!assignment;
      }
    }

    if (!isSuperAdmin && !isClubAdmin && !isCoach) {
      return NextResponse.json(
        { error: "You do not have permission to enter results for this match" },
        { status: 403 }
      );
    }

    // Update match score and status
    const { error: matchError } = await supabase
      .from("matches")
      .update({
        home_score: home_score || 0,
        away_score: away_score || 0,
        status: "completed",
      })
      .eq("id", matchId);

    if (matchError) {
      console.error("Error updating match:", matchError);
      return NextResponse.json(
        { error: "Failed to update match" },
        { status: 500 }
      );
    }

    // Delete existing statistics for this match
    await supabase.from("match_statistics").delete().eq("match_id", matchId);

    // Insert player statistics
    if (player_stats && player_stats.length > 0) {
      const statsData = player_stats.map((stat: PlayerStat) => ({
        match_id: matchId,
        player_id: stat.player_id,
        goals: stat.goals || 0,
        assists: stat.assists || 0,
        yellow_cards: stat.yellow_cards || 0,
        red_cards: stat.red_cards || 0,
        saves: stat.saves || null,
        shots_on_target: stat.shots_on_target || null,
        passes_completed: stat.passes_completed || null,
        rating: stat.rating || null,
        notes: stat.notes || null,
      }));

      const { error: statsError } = await supabase
        .from("match_statistics")
        .insert(statsData);

      if (statsError) {
        console.error("Error inserting player statistics:", statsError);
        return NextResponse.json(
          { error: "Failed to save player statistics" },
          { status: 500 }
        );
      }
    }

    // Update minutes_played in match_squads based on who played
    if (player_stats && player_stats.length > 0) {
      for (const stat of player_stats) {
        await supabase
          .from("match_squads")
          .update({ minutes_played: 90 }) // Default to 90 minutes, can be customized
          .eq("match_id", matchId)
          .eq("player_id", stat.player_id);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Match results saved successfully",
    });
  } catch (error) {
    console.error("Error in save match results route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
