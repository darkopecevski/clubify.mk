import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import MatchesPageClient from "./page-client";

export default async function CoachMatchesPage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has coach role
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .in("role", ["super_admin", "coach"]);

  if (!roles || roles.length === 0) {
    redirect("/unauthorized");
  }

  return <MatchesPageClient />;
}
