import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TrainingListClient from "./page-client";

export default async function TrainingPage() {
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

  let teams: any[] = [];

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
          name
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
        club: team.clubs,
      })) || [];
  } else if (isClubAdmin) {
    // Club admin: show all teams from their clubs
    const clubIds = roles?.filter((r) => r.role === "club_admin").map((r) => r.club_id) || [];

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
          name
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
          team_id,
          teams:team_id (
            id,
            name,
            age_group,
            season,
            clubs:club_id (
              id,
              name
            )
          )
        `
        )
        .eq("coach_id", coach.id)
        .eq("is_active", true)
        .not("teams", "is", null);

      teams =
        teamAssignments?.map((assignment) => ({
          id: (assignment.teams as any).id,
          name: (assignment.teams as any).name,
          age_group: (assignment.teams as any).age_group,
          season: (assignment.teams as any).season,
          club: (assignment.teams as any).clubs,
        })) || [];
    }
  }

  const teamIds = teams.map((t) => t.id);

  // Get all training sessions for coach's teams (upcoming first, then past)
  const today = new Date().toISOString().split("T")[0];

  const { data: trainingSessions } = await supabase
    .from("training_sessions")
    .select(
      `
      id,
      session_date,
      start_time,
      duration_minutes,
      location,
      notes,
      recurrence_id,
      is_override,
      created_at,
      teams:team_id (
        id,
        name,
        age_group
      )
    `
    )
    .in("team_id", teamIds.length > 0 ? teamIds : ["00000000-0000-0000-0000-000000000000"])
    .order("session_date", { ascending: false })
    .order("start_time", { ascending: false });

  // Separate into upcoming and past
  const upcoming = trainingSessions?.filter((s) => s.session_date >= today) || [];
  const past = trainingSessions?.filter((s) => s.session_date < today) || [];

  // Sort upcoming ascending (soonest first), past descending (most recent first)
  upcoming.sort((a, b) => {
    if (a.session_date !== b.session_date) return a.session_date.localeCompare(b.session_date);
    return a.start_time.localeCompare(b.start_time);
  });

  return (
    <TrainingListClient
      teams={teams}
      upcomingSessions={upcoming}
      pastSessions={past}
    />
  );
}
