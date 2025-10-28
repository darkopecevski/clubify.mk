import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AttendanceClient from "./page-client";

export default async function AttendancePage() {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is coach, club_admin, or super_admin
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role, club_id")
    .eq("user_id", user.id)
    .in("role", ["super_admin", "club_admin", "coach"]);

  if (!roles || roles.length === 0) {
    redirect("/unauthorized");
  }

  // Get teams accessible by this user
  const isSuperAdmin = roles.some((r) => r.role === "super_admin");
  let teamsQuery = supabase
    .from("teams")
    .select("id, name, age_group, club_id, clubs:club_id(name)");

  if (!isSuperAdmin) {
    const clubIds = roles
      .filter((r) => r.role === "club_admin" && r.club_id)
      .map((r) => r.club_id!)
      .filter((id): id is string => id !== null);

    if (clubIds.length > 0) {
      teamsQuery = teamsQuery.in("club_id", clubIds);
    } else if (roles.some((r) => r.role === "coach")) {
      // Get teams assigned to this coach
      const { data: coach } = await supabase
        .from("coaches")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (coach) {
        const { data: assignments } = await supabase
          .from("team_coaches")
          .select("team_id")
          .eq("coach_id", coach.id)
          .eq("is_active", true);

        const teamIds = assignments?.map((a) => a.team_id) || [];
        if (teamIds.length > 0) {
          teamsQuery = teamsQuery.in("id", teamIds);
        }
      }
    }
  }

  const { data: teams } = await teamsQuery;

  return <AttendanceClient teams={teams || []} />;
}
