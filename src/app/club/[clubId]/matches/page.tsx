import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MatchesPageClient from "./page-client";

export default async function ClubMatchesPage({
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

  return <MatchesPageClient clubId={clubId} />;
}
