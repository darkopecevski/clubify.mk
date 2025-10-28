import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/coach/teams - Fetch all teams for the current coach with rosters and stats
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

    // Check if user has coach role
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .in("role", ["super_admin", "coach"]);

    if (!roles || roles.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const isSuperAdmin = roles.some((r) => r.role === "super_admin");

    // Get coach record
    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!coach && !isSuperAdmin) {
      return NextResponse.json(
        { error: "Coach profile not found" },
        { status: 404 }
      );
    }

    // Get all teams assigned to this coach (or all teams if super_admin)
    let teamsQuery = supabase
      .from("teams")
      .select(
        `
        id,
        name,
        age_group,
        season,
        is_active,
        clubs:club_id (
          id,
          name,
          logo_url
        )
      `
      )
      .eq("is_active", true)
      .order("name");

    // If not super admin, filter by coach assignments
    if (!isSuperAdmin && coach) {
      const { data: assignments } = await supabase
        .from("team_coaches")
        .select("team_id, role")
        .eq("coach_id", coach.id)
        .eq("is_active", true);

      const teamIds = assignments?.map((a) => a.team_id) || [];

      if (teamIds.length === 0) {
        return NextResponse.json({ teams: [] });
      }

      teamsQuery = teamsQuery.in("id", teamIds);
    }

    const { data: teams } = await teamsQuery;

    if (!teams || teams.length === 0) {
      return NextResponse.json({ teams: [] });
    }

    // Get coach roles for each team
    const teamIds = teams.map((t) => t.id);
    const { data: coachAssignments } = await supabase
      .from("team_coaches")
      .select("team_id, role")
      .eq("coach_id", coach?.id || "")
      .in("team_id", teamIds)
      .eq("is_active", true);

    const coachRoleMap = new Map(
      coachAssignments?.map((a) => [a.team_id, a.role]) || []
    );

    // Get team players with player details
    const { data: teamPlayers } = await supabase
      .from("team_players")
      .select(
        `
        id,
        team_id,
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
      .in("team_id", teamIds)
      .is("left_at", null);

    // Group players by team
    const playersByTeam = new Map<string, typeof teamPlayers>();
    teamPlayers?.forEach((tp) => {
      const existing = playersByTeam.get(tp.team_id) || [];
      playersByTeam.set(tp.team_id, [...existing, tp]);
    });

    // Calculate attendance stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateThreshold = thirtyDaysAgo.toISOString().split("T")[0];

    const { data: recentSessions } = await supabase
      .from("training_sessions")
      .select("id, team_id")
      .in("team_id", teamIds)
      .gte("session_date", dateThreshold);

    const sessionIdsByTeam = new Map<string, string[]>();
    recentSessions?.forEach((s) => {
      const existing = sessionIdsByTeam.get(s.team_id) || [];
      sessionIdsByTeam.set(s.team_id, [...existing, s.id]);
    });

    // Get attendance records for these sessions
    const allSessionIds = recentSessions?.map((s) => s.id) || [];
    const { data: attendanceRecords } = await supabase
      .from("attendance")
      .select("training_session_id, status")
      .in("training_session_id", allSessionIds);

    // Calculate attendance percentage by team
    const attendanceByTeam = new Map<string, { present: number; total: number }>();
    attendanceRecords?.forEach((record) => {
      const session = recentSessions?.find((s) => s.id === record.training_session_id);
      if (!session) return;

      const stats = attendanceByTeam.get(session.team_id) || { present: 0, total: 0 };
      stats.total += 1;
      if (record.status === "present") {
        stats.present += 1;
      }
      attendanceByTeam.set(session.team_id, stats);
    });

    // Get upcoming training sessions (next 30 days)
    const today = new Date().toISOString().split("T")[0];
    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    const dateFuture = thirtyDaysLater.toISOString().split("T")[0];

    const { data: upcomingTraining } = await supabase
      .from("training_sessions")
      .select("id, team_id")
      .in("team_id", teamIds)
      .gte("session_date", today)
      .lte("session_date", dateFuture);

    const upcomingTrainingByTeam = new Map<string, number>();
    upcomingTraining?.forEach((s) => {
      upcomingTrainingByTeam.set(
        s.team_id,
        (upcomingTrainingByTeam.get(s.team_id) || 0) + 1
      );
    });

    // Get upcoming matches (next 30 days)
    const { data: upcomingMatches } = await supabase
      .from("matches")
      .select("id, home_team_id")
      .in("home_team_id", teamIds)
      .gte("match_date", today)
      .lte("match_date", dateFuture)
      .neq("status", "cancelled");

    const upcomingMatchesByTeam = new Map<string, number>();
    upcomingMatches?.forEach((m) => {
      upcomingMatchesByTeam.set(
        m.home_team_id,
        (upcomingMatchesByTeam.get(m.home_team_id) || 0) + 1
      );
    });

    // Build response with all data
    const teamsWithStats = teams.map((team) => {
      const players = playersByTeam.get(team.id) || [];
      const activePlayers = players.filter((p) => p.players?.is_active);
      const attendanceStats = attendanceByTeam.get(team.id);
      const avgAttendance = attendanceStats
        ? Math.round((attendanceStats.present / attendanceStats.total) * 100)
        : null;

      return {
        id: team.id,
        name: team.name,
        age_group: team.age_group,
        season: team.season,
        is_active: team.is_active,
        club: team.clubs,
        coach_role: coachRoleMap.get(team.id) || "Coach",
        player_count: players.length,
        active_player_count: activePlayers.length,
        avg_attendance: avgAttendance,
        upcoming_training_count: upcomingTrainingByTeam.get(team.id) || 0,
        upcoming_matches_count: upcomingMatchesByTeam.get(team.id) || 0,
        players: players.map((p) => ({
          id: p.id,
          joined_at: p.joined_at,
          player: p.players,
        })),
      };
    });

    return NextResponse.json({ teams: teamsWithStats });
  } catch (error) {
    console.error("Error fetching coach teams:", error);

    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
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
