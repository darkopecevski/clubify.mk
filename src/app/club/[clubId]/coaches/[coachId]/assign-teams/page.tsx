import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AssignTeamsClient from "./page-client";

export default async function AssignTeamsPage({
  params,
}: {
  params: Promise<{ clubId: string; coachId: string }>;
}) {
  const { clubId, coachId } = await params;
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch coach with user info
  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select(
      `
      id,
      club_id,
      user_id,
      users:user_id (
        full_name
      )
    `
    )
    .eq("id", coachId)
    .eq("club_id", clubId)
    .single();

  if (coachError || !coach) {
    redirect(`/club/${clubId}/coaches`);
  }

  // Fetch all teams for this club
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, name, age_group, is_active")
    .eq("club_id", clubId)
    .eq("is_active", true)
    .order("name");

  if (teamsError) {
    console.error("Error fetching teams:", teamsError);
  }

  // Fetch current team assignments for this coach
  const { data: currentAssignments, error: assignmentsError } = await supabase
    .from("team_coaches")
    .select(
      `
      id,
      team_id,
      role,
      assigned_at,
      is_active
    `
    )
    .eq("coach_id", coachId)
    .eq("is_active", true);

  if (assignmentsError) {
    console.error("Error fetching assignments:", assignmentsError);
  }

  return (
    <AssignTeamsClient
      clubId={clubId}
      coach={{
        id: coach.id,
        name: coach.users?.full_name || "Unknown Coach",
      }}
      teams={teams || []}
      currentAssignments={currentAssignments || []}
    />
  );
}
