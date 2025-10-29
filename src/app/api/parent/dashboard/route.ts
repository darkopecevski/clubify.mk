import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/parent/dashboard?childId=xxx - Get dashboard data for parent
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");

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

    // Verify parent-child relationship if childId provided
    if (childId) {
      const { data: parentCheck } = await supabase
        .from("player_parents")
        .select("player_id")
        .eq("parent_user_id", user.id)
        .eq("player_id", childId)
        .single();

      if (!parentCheck) {
        return NextResponse.json({ error: "Forbidden - Not your child" }, { status: 403 });
      }
    }

    // Get all children IDs for this parent
    const { data: children } = await supabase
      .from("player_parents")
      .select("player_id")
      .eq("parent_user_id", user.id);

    const childIds = childId ? [childId] : children?.map((c) => c.player_id) || [];

    if (childIds.length === 0) {
      return NextResponse.json({
        upcomingTraining: [],
        upcomingMatches: [],
        recentAttendance: [],
        attendanceStats: null,
      });
    }

    // Get team IDs for these children
    const { data: teamPlayers } = await supabase
      .from("team_players")
      .select("team_id, player_id")
      .in("player_id", childIds)
      .is("left_date", null);

    const teamIds = [...new Set(teamPlayers?.map((tp) => tp.team_id) || [])];

    if (teamIds.length === 0) {
      return NextResponse.json({
        upcomingTraining: [],
        upcomingMatches: [],
        recentAttendance: [],
        attendanceStats: null,
      });
    }

    // Get today's date
    const today = new Date().toISOString().split("T")[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Get upcoming training sessions (next 7 days)
    const { data: trainingData } = await supabase
      .from("training_sessions")
      .select(
        `
        id,
        session_date,
        start_time,
        duration_minutes,
        location,
        teams:team_id (
          id,
          name,
          age_group
        )
      `
      )
      .in("team_id", teamIds)
      .gte("session_date", today)
      .lte("session_date", nextWeek)
      .eq("is_cancelled", false)
      .order("session_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(5);

    // Get upcoming matches (next 7 days)
    const { data: matchesData } = await supabase
      .from("matches")
      .select(
        `
        id,
        match_date,
        match_time,
        away_team_name,
        venue,
        competition_type,
        teams:team_id (
          id,
          name,
          age_group
        )
      `
      )
      .in("team_id", teamIds)
      .gte("match_date", today)
      .lte("match_date", nextWeek)
      .neq("status", "cancelled")
      .order("match_date", { ascending: true })
      .order("match_time", { ascending: true })
      .limit(5);

    // Get recent attendance (last 10 records)
    const { data: attendanceData } = await supabase
      .from("attendance")
      .select(
        `
        id,
        status,
        arrival_time,
        notes,
        training_sessions:training_session_id (
          id,
          session_date,
          start_time,
          teams:team_id (
            id,
            name
          )
        )
      `
      )
      .in("player_id", childIds)
      .order("created_at", { ascending: false })
      .limit(10);

    // Calculate attendance stats (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const { data: recentAttendance } = await supabase
      .from("attendance")
      .select(
        `
        status,
        training_sessions:training_session_id (
          session_date
        )
      `
      )
      .in("player_id", childIds)
      .gte("training_sessions.session_date", thirtyDaysAgo);

    // Calculate stats
    const totalSessions = recentAttendance?.length || 0;
    const present = recentAttendance?.filter(
      (a: { status: string }) => a.status === "present" || a.status === "late"
    ).length || 0;
    const attendancePercentage = totalSessions > 0 ? Math.round((present / totalSessions) * 100) : 0;

    return NextResponse.json({
      upcomingTraining: trainingData || [],
      upcomingMatches: matchesData || [],
      recentAttendance: attendanceData || [],
      attendanceStats: {
        totalSessions,
        present,
        attendancePercentage,
      },
    });
  } catch (error) {
    console.error("Error in /api/parent/dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
