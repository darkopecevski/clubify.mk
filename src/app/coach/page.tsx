import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CoachDashboardClient from "./page-client";

export default async function CoachDashboardPage() {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check user roles
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role, club_id")
    .eq("user_id", user.id);

  const isSuperAdmin = roles?.some((r) => r.role === "super_admin") || false;
  const isClubAdmin = roles?.some((r) => r.role === "club_admin") || false;
  const isCoach = roles?.some((r) => r.role === "coach") || false;

  type TeamWithClub = {
    id: string;
    name: string;
    age_group: string | null;
    season: string | null;
    role: string;
    club: {
      id: string;
      name: string;
      logo_url: string | null;
    } | null;
  };

  let teams: TeamWithClub[] = [];

  if (isSuperAdmin) {
    // Super admin: show all teams from all clubs
    const { data: allTeams } = await supabase
      .from("teams")
      .select(
        `
        id,
        name,
        age_group,
        season,
        clubs:club_id (
          id,
          name,
          logo_url
        )
      `
      )
      .eq("is_active", true);

    teams =
      allTeams?.map((team) => ({
        id: team.id,
        name: team.name,
        age_group: team.age_group,
        season: team.season,
        role: "super_admin",
        club: team.clubs,
      })) || [];
  } else if (isClubAdmin) {
    // Club admin: show all teams from their clubs
    const clubIds = roles?.filter((r) => r.role === "club_admin" && r.club_id).map((r) => r.club_id!) || [];

    const { data: clubTeams } = await supabase
      .from("teams")
      .select(
        `
        id,
        name,
        age_group,
        season,
        clubs:club_id (
          id,
          name,
          logo_url
        )
      `
      )
      .in("club_id", clubIds.length > 0 ? clubIds : ["00000000-0000-0000-0000-000000000000"])
      .eq("is_active", true);

    teams =
      clubTeams?.map((team) => ({
        id: team.id,
        name: team.name,
        age_group: team.age_group,
        season: team.season,
        role: "club_admin",
        club: team.clubs,
      })) || [];
  } else if (isCoach) {
    // Coach: show only assigned teams
    // First get the coach record for this user
    const { data: coach } = await supabase
      .from("coaches")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (coach) {
      const { data: teamAssignments } = await supabase
        .from("team_coaches")
        .select(
          `
          id,
          role,
          is_active,
          assigned_at,
          teams:team_id (
            id,
            name,
            age_group,
            season,
            clubs:club_id (
              id,
              name,
              logo_url
            )
          )
        `
        )
        .eq("coach_id", coach.id)
        .eq("is_active", true)
        .not("teams", "is", null);

      teams =
        teamAssignments?.map((assignment) => {
          const team = assignment.teams as {
            id: string;
            name: string;
            age_group: string | null;
            season: string | null;
            clubs: {
              id: string;
              name: string;
              logo_url: string | null;
            } | null;
          };
          return {
            id: team.id,
            name: team.name,
            age_group: team.age_group,
            season: team.season,
            role: assignment.role,
            club: team.clubs,
          };
        }) || [];
    }
  }

  // Get team IDs for filtering
  const teamIds = teams.map((t) => t.id);

  // Get upcoming training sessions (next 7 days)
  const today = new Date().toISOString().split("T")[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data: upcomingTraining } = await supabase
    .from("training_sessions")
    .select(
      `
      id,
      session_date,
      start_time,
      duration_minutes,
      location,
      notes,
      teams:team_id (
        id,
        name,
        age_group
      )
    `
    )
    .in("team_id", teamIds.length > 0 ? teamIds : ["00000000-0000-0000-0000-000000000000"])
    .gte("session_date", today)
    .lte("session_date", nextWeek)
    .order("session_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(5);

  // Get upcoming matches (next 7 days)
  const { data: upcomingMatches } = await supabase
    .from("matches")
    .select(
      `
      id,
      match_date,
      start_time,
      away_team_name,
      location,
      competition,
      status,
      teams:home_team_id (
        id,
        name,
        age_group,
        clubs:club_id (
          id,
          name
        )
      )
    `
    )
    .in("home_team_id", teamIds.length > 0 ? teamIds : ["00000000-0000-0000-0000-000000000000"])
    .gte("match_date", today)
    .lte("match_date", nextWeek)
    .order("match_date", { ascending: true })
    .order("start_time", { ascending: true })
    .limit(5);

  // Get recent attendance stats (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const { data: recentSessions } = await supabase
    .from("training_sessions")
    .select("id, team_id")
    .in("team_id", teamIds.length > 0 ? teamIds : ["00000000-0000-0000-0000-000000000000"])
    .gte("session_date", thirtyDaysAgo)
    .lte("session_date", today);

  const sessionIds = recentSessions?.map((s) => s.id) || [];

  const { data: attendanceRecords } = await supabase
    .from("attendance")
    .select("status")
    .in("training_session_id", sessionIds.length > 0 ? sessionIds : ["00000000-0000-0000-0000-000000000000"]);

  const totalAttendance = attendanceRecords?.length || 0;
  const presentCount =
    attendanceRecords?.filter((r) => r.status === "present").length || 0;
  const lateCount =
    attendanceRecords?.filter((r) => r.status === "late").length || 0;
  const attendancePercentage =
    totalAttendance > 0 ? Math.round(((presentCount + lateCount) / totalAttendance) * 100) : 0;

  return (
    <CoachDashboardClient
      teams={teams}
      upcomingTraining={upcomingTraining || []}
      upcomingMatches={upcomingMatches || []}
      attendanceStats={{
        percentage: attendancePercentage,
        totalSessions: recentSessions?.length || 0,
      }}
    />
  );
}
