"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useUserRole } from "@/hooks/use-user-role";
import type { RoleType } from "@/lib/auth/roles";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Require user to be authenticated */
  requireAuth?: boolean;
  /** Require specific role */
  requireRole?: RoleType;
  /** Require minimum role level (uses hierarchy) */
  requireMinimumRole?: RoleType;
  /** Require access to specific club */
  requireClubAccess?: string;
  /** Redirect path if access denied */
  redirectTo?: string;
  /** Custom unauthorized message */
  unauthorizedMessage?: string;
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireRole,
  requireMinimumRole,
  requireClubAccess,
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { roles, isLoading: rolesLoading, hasRole, isSuperAdmin } = useUserRole();

  useEffect(() => {
    // Wait for both user and roles to load
    if (userLoading || rolesLoading) return;

    // Check if authentication is required
    if (requireAuth && !user) {
      router.push(redirectTo);
      return;
    }

    // If no user, skip role checks
    if (!user) return;

    // Check if specific role is required
    if (requireRole && !hasRole(requireRole, requireClubAccess)) {
      router.push("/unauthorized");
      return;
    }

    // Check if minimum role level is required
    if (requireMinimumRole) {
      const roleHierarchy: RoleType[] = ["parent", "coach", "club_admin", "super_admin"];
      const minimumRoleIndex = roleHierarchy.indexOf(requireMinimumRole);

      const userHasMinimumRole = isSuperAdmin() || roles.some(role => {
        const userRoleIndex = roleHierarchy.indexOf(role.role as RoleType);
        const matchesClub = !requireClubAccess || role.club_id === requireClubAccess || role.role === "super_admin";
        return userRoleIndex >= minimumRoleIndex && matchesClub;
      });

      if (!userHasMinimumRole) {
        router.push("/unauthorized");
        return;
      }
    }

    // Check if club access is required (without specific role)
    if (requireClubAccess && !requireRole && !requireMinimumRole) {
      const hasAccess = isSuperAdmin() || roles.some(r => r.club_id === requireClubAccess);
      if (!hasAccess) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [
    user,
    userLoading,
    rolesLoading,
    roles,
    requireAuth,
    requireRole,
    requireMinimumRole,
    requireClubAccess,
    router,
    redirectTo,
    hasRole,
    isSuperAdmin,
  ]);

  // Show loading state while checking authentication
  if (userLoading || rolesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 animate-spin text-green-600"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // If authentication required but no user, don't render children (will redirect)
  if (requireAuth && !user) {
    return null;
  }

  return <>{children}</>;
}
