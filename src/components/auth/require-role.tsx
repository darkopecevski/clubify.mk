"use client";

import { useUserRole } from "@/hooks/use-user-role";
import type { RoleType } from "@/lib/auth/roles";

interface RequireRoleProps {
  children: React.ReactNode;
  /** Require specific role */
  role?: RoleType;
  /** Require minimum role level (uses hierarchy) */
  minimumRole?: RoleType;
  /** Require access to specific club */
  clubId?: string;
  /** Content to show if user doesn't have required role */
  fallback?: React.ReactNode;
}

/**
 * Component to conditionally render children based on user role
 * Usage:
 * <RequireRole role="super_admin">
 *   <AdminPanel />
 * </RequireRole>
 */
export function RequireRole({
  children,
  role,
  minimumRole,
  clubId,
  fallback = null,
}: RequireRoleProps) {
  const { roles, isLoading, isSuperAdmin } = useUserRole();

  // Don't render anything while loading
  if (isLoading) {
    return null;
  }

  // Super admin has access to everything
  if (isSuperAdmin()) {
    return <>{children}</>;
  }

  // Check for specific role
  if (role) {
    const hasRequiredRole = roles.some(
      (r) =>
        r.role === role && (clubId ? r.club_id === clubId : true)
    );

    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  // Check for minimum role level
  if (minimumRole) {
    const roleHierarchy: RoleType[] = [
      "parent",
      "coach",
      "club_admin",
      "super_admin",
    ];
    const minimumRoleIndex = roleHierarchy.indexOf(minimumRole);

    const hasMinimumRole = roles.some((r) => {
      const userRoleIndex = roleHierarchy.indexOf(r.role as RoleType);
      const matchesClub = !clubId || r.club_id === clubId;
      return userRoleIndex >= minimumRoleIndex && matchesClub;
    });

    if (!hasMinimumRole) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}

/**
 * Show content only to super admins
 */
export function SuperAdminOnly({
  children,
  fallback,
}: {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return (
    <RequireRole role="super_admin" fallback={fallback}>
      {children}
    </RequireRole>
  );
}

/**
 * Show content only to club admins
 */
export function ClubAdminOnly({
  children,
  clubId,
  fallback,
}: {
  children: React.ReactNode;
  clubId?: string;
  fallback?: React.ReactNode;
}) {
  return (
    <RequireRole minimumRole="club_admin" clubId={clubId} fallback={fallback}>
      {children}
    </RequireRole>
  );
}

/**
 * Show content only to coaches and above
 */
export function CoachOnly({
  children,
  clubId,
  fallback,
}: {
  children: React.ReactNode;
  clubId?: string;
  fallback?: React.ReactNode;
}) {
  return (
    <RequireRole minimumRole="coach" clubId={clubId} fallback={fallback}>
      {children}
    </RequireRole>
  );
}
