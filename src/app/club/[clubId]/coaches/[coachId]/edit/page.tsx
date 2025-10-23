import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EditCoachForm from "./edit-coach-form";

export default async function EditCoachPage({
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
      users:user_id (
        full_name,
        phone
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

  return (
    <div className="space-y-6">
      <EditCoachForm clubId={clubId} coach={{ ...coach, email }} />
    </div>
  );
}
