import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/players/[playerId]/match-statistics - Get player's match statistics
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

    // Get all match statistics for this player
    const { data: matchStats, error: statsError } = await supabase
      .from("match_statistics")
      .select(
        `
        id,
        goals,
        assists,
        yellow_cards,
        red_cards,
        rating,
        saves,
        shots_on_target,
        passes_completed,
        notes,
        matches:match_id (
          id,
          match_date,
          start_time,
          home_score,
          away_score,
          away_team_name,
          location,
          competition,
          status,
          teams:home_team_id (
            id,
            name,
            age_group
          )
        )
      `
      )
      .eq("player_id", playerId)
      .order("matches(match_date)", { ascending: false });

    if (statsError) {
      console.error("Error fetching match statistics:", statsError);
      return NextResponse.json(
        { error: "Failed to fetch match statistics" },
        { status: 500 }
      );
    }

    // Get match squads to calculate matches played and minutes
    const { data: squadRecords, error: squadError } = await supabase
      .from("match_squads")
      .select(
        `
        id,
        minutes_played,
        is_starting,
        matches:match_id (
          id,
          match_date,
          status
        )
      `
      )
      .eq("player_id", playerId);

    if (squadError) {
      console.error("Error fetching squad records:", squadError);
    }

    console.log("Squad records count:", squadRecords?.length || 0);
    console.log("Match stats count:", matchStats?.length || 0);

    // Calculate statistics
    const now = new Date();
    const currentYear = now.getFullYear();
    const seasonStart = new Date(currentYear, 0, 1); // January 1st of current year

    // Filter for current season
    const thisSeasonStats = matchStats?.filter((stat) => {
      const matchDate = new Date(stat.matches.match_date);
      return matchDate >= seasonStart;
    }) || [];

    const allTimeStats = matchStats || [];

    // Calculate totals
    const calculateTotals = (stats: typeof matchStats) => {
      const ratingsCount = stats.filter(s => s.rating).length;
      return {
        matchesPlayed: stats.length,
        goals: stats.reduce((sum, s) => sum + (s.goals || 0), 0),
        assists: stats.reduce((sum, s) => sum + (s.assists || 0), 0),
        yellowCards: stats.reduce((sum, s) => sum + (s.yellow_cards || 0), 0),
        redCards: stats.reduce((sum, s) => sum + (s.red_cards || 0), 0),
        saves: stats.reduce((sum, s) => sum + (s.saves || 0), 0),
        shotsOnTarget: stats.reduce((sum, s) => sum + (s.shots_on_target || 0), 0),
        passesCompleted: stats.reduce((sum, s) => sum + (s.passes_completed || 0), 0),
        averageRating:
          ratingsCount > 0
            ? Math.round((stats.reduce((sum, s) => sum + (s.rating || 0), 0) / ratingsCount) * 10) / 10
            : 0,
      };
    };

    // Calculate minutes played
    const totalMinutesPlayed = squadRecords?.reduce(
      (sum, record) => sum + (record.minutes_played || 0),
      0
    ) || 0;

    const thisSeasonTotals = calculateTotals(thisSeasonStats);
    const allTimeTotals = calculateTotals(allTimeStats);

    // Calculate total matches from squad records (not just stats)
    const totalMatches = squadRecords?.length || 0;

    const summary = {
      matchesPlayed: totalMatches,
      matchesThisSeason: thisSeasonTotals.matchesPlayed,
      matchesAllTime: totalMatches,
      totalGoals: allTimeTotals.goals,
      goalsPerMatch: totalMatches > 0
        ? Math.round((allTimeTotals.goals / totalMatches) * 10) / 10
        : 0,
      totalAssists: allTimeTotals.assists,
      assistsPerMatch: totalMatches > 0
        ? Math.round((allTimeTotals.assists / totalMatches) * 10) / 10
        : 0,
      yellowCards: allTimeTotals.yellowCards,
      redCards: allTimeTotals.redCards,
      averageRating: allTimeTotals.averageRating,
      minutesPlayed: totalMinutesPlayed,
      thisSeason: thisSeasonTotals,
      allTime: allTimeTotals,
    };

    // Count matches scheduled vs played (completed matches)
    const matchesScheduled = squadRecords?.filter(
      (record) => record.matches.status === "scheduled"
    ).length || 0;

    const matchesCompleted = squadRecords?.filter(
      (record) => record.matches.status === "completed"
    ).length || 0;

    // Get recent matches (last 10 with stats) and format them
    const recentMatches = allTimeStats.slice(0, 10).map((stat) => {
      const match = stat.matches;
      const homeScore = match.home_score ?? 0;
      const awayScore = match.away_score ?? 0;

      return {
        date: match.match_date,
        opponent: match.away_team_name,
        score: `${homeScore}-${awayScore}`,
        result: homeScore > awayScore ? 'win' : homeScore < awayScore ? 'loss' : 'draw',
        goals: stat.goals || 0,
        assists: stat.assists || 0,
        rating: stat.rating || null,
        yellowCards: stat.yellow_cards || 0,
        redCards: stat.red_cards || 0,
      };
    });

    return NextResponse.json({
      summary,
      totalMinutesPlayed,
      matchesScheduled,
      matchesCompleted,
      recentMatches,
    });
  } catch (error) {
    console.error("Error in match statistics route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
