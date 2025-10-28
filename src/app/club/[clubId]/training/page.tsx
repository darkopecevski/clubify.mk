import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import TrainingListClient from "./page-client";

export default async function ClubTrainingPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is super_admin or club_admin for this club
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role, club_id")
    .eq("user_id", user.id)
    .in("role", ["super_admin", "club_admin"]);

  const isSuperAdmin = roles?.some((r) => r.role === "super_admin");
  const isClubAdmin = roles?.some(
    (r) => r.role === "club_admin" && r.club_id === clubId
  );

  if (!isSuperAdmin && !isClubAdmin) {
    redirect("/unauthorized");
  }

  // Get all teams for this club
  const { data: teamsData } = await supabase
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
    .eq("club_id", clubId)
    .eq("is_active", true);

  // Transform teams data to match expected type (clubs -> club)
  const teams = teamsData?.map((t) => ({
    id: t.id,
    name: t.name,
    age_group: t.age_group,
    season: t.season,
    club: t.clubs as { id: string; name: string } | null,
  }));

  const teamIds = teams?.map((t) => t.id) || [];

  // Get all training sessions for club's teams (upcoming first, then past)
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

  return (
    <TrainingListClient
      teams={teams || []}
      upcomingSessions={upcoming}
      pastSessions={past}
    />
  );
}
