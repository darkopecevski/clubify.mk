import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CoachProfileClient from "./page-client";

export default async function CoachProfilePage({
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
  const { data: coach, error } = await supabase
    .from("coaches")
    .select(
      `
      id,
      club_id,
      user_id,
      license_type,
      license_number,
      specialization,
      years_of_experience,
      bio,
      photo_url,
      is_active,
      created_at,
      users:user_id (
        full_name,
        phone,
        avatar_url
      )
    `
    )
    .eq("id", coachId)
    .eq("club_id", clubId)
    .single();

  if (error || !coach) {
    redirect(`/club/${clubId}/coaches`);
  }

  // Get email
  const { data: allUsers } = await supabase.rpc("get_users_with_email");
  const userWithEmail = allUsers?.find(
    (u: { id: string }) => u.id === coach.user_id
  );
  const email = userWithEmail?.email || "";

  // Get team assignments
  const { data: teamAssignments } = await supabase
    .from("team_coaches")
    .select(
      `
      id,
      role,
      assigned_at,
      is_active,
      teams:team_id (
        id,
        name,
        age_group
      )
    `
    )
    .eq("coach_id", coachId)
    .eq("is_active", true);

  return (
    <CoachProfileClient
      clubId={clubId}
      coach={{ ...coach, email }}
      teamAssignments={teamAssignments || []}
    />
  );
}
