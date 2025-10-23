import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import CoachesPageClient from "./page-client";

export default async function CoachesPage({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = await params;
  const supabase = await createClient();

  // Check auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch coaches with user info and team assignments
  const { data: coaches, error } = await supabase
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
    .eq("club_id", clubId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching coaches:", error);
  }

  // Get auth user emails for coaches
  const coachUserIds = coaches?.map((c) => c.user_id) || [];
  let coachEmails: Record<string, string> = {};

  if (coachUserIds.length > 0) {
    const { data: allUsers } = await supabase.rpc("get_users_with_email");
    if (allUsers) {
      coachEmails = allUsers.reduce(
        (acc: Record<string, string>, u: { id: string; email: string }) => {
          if (coachUserIds.includes(u.id)) {
            acc[u.id] = u.email;
          }
          return acc;
        },
        {}
      );
    }
  }

  // Get team assignments for each coach
  const { data: teamAssignments } = await supabase
    .from("team_coaches")
    .select(
      `
      id,
      coach_id,
      role,
      is_active,
      teams:team_id (
        id,
        name
      )
    `
    )
    .in(
      "coach_id",
      coaches?.map((c) => c.id) || []
    )
    .eq("is_active", true);

  // Map coaches with emails and team assignments
  const coachesWithDetails = coaches?.map((coach) => ({
    ...coach,
    email: coachEmails[coach.user_id] || "",
    teams:
      teamAssignments?.filter((ta) => ta.coach_id === coach.id) || [],
  }));

  return (
    <CoachesPageClient
      clubId={clubId}
      coaches={coachesWithDetails || []}
    />
  );
}
