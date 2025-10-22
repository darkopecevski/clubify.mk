import { createClient } from "@/lib/supabase/client";

/**
 * Get the appropriate dashboard URL based on user's highest role
 * Role hierarchy: player < parent < coach < club_admin < super_admin
 */
export async function getRoleDashboardUrl(): Promise<string> {
  const supabase = createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return "/login";
    }

    // Fetch user roles
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, club_id")
      .eq("user_id", user.id);

    if (!roles || roles.length === 0) {
      // No roles assigned, redirect to home
      return "/";
    }

    // Check roles in order of hierarchy (highest to lowest)
    const hasRole = (role: string) => roles.some(r => r.role === role);

    if (hasRole("super_admin")) {
      return "/admin";
    }

    if (hasRole("club_admin")) {
      // Get the first club the user has access to
      const clubAdminRole = roles.find(r => r.role === "club_admin");
      if (clubAdminRole?.club_id) {
        return `/club/${clubAdminRole.club_id}`;
      }
      return "/club"; // Fallback in case no club_id found
    }

    if (hasRole("coach")) {
      return "/coach"; // Will be implemented in future
    }

    if (hasRole("parent")) {
      return "/parent"; // Will be implemented in future
    }

    if (hasRole("player")) {
      return "/player"; // Will be implemented in future
    }

    // Fallback to home
    return "/";
  } catch (error) {
    console.error("Error getting role dashboard:", error);
    return "/";
  }
}
