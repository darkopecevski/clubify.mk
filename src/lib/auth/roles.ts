import type { Database } from "@/types/database.types";

type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];

/**
 * Role hierarchy for permission checking
 * Higher index = more permissions
 */
const ROLE_HIERARCHY = ["parent", "coach", "club_admin", "super_admin"] as const;

export type RoleType = (typeof ROLE_HIERARCHY)[number];

/**
 * Check if a user has a specific role
 */
export function hasRole(
  roles: UserRole[],
  requiredRole: RoleType,
  clubId?: string
): boolean {
  if (!roles.length) return false;

  // Super admin has access to everything
  if (roles.some((r) => r.role === "super_admin")) {
    return true;
  }

  // Check for specific role
  if (clubId) {
    return roles.some(
      (r) => r.role === requiredRole && r.club_id === clubId
    );
  }

  return roles.some((r) => r.role === requiredRole);
}

/**
 * Check if a user has at least the minimum required role level
 * Uses role hierarchy: super_admin > club_admin > coach > parent
 */
export function hasMinimumRole(
  roles: UserRole[],
  minimumRole: RoleType,
  clubId?: string
): boolean {
  if (!roles.length) return false;

  const minimumRoleIndex = ROLE_HIERARCHY.indexOf(minimumRole);

  for (const userRole of roles) {
    const userRoleIndex = ROLE_HIERARCHY.indexOf(
      userRole.role as RoleType
    );

    // If club-specific check, verify club ID matches
    if (clubId && userRole.club_id !== clubId && userRole.role !== "super_admin") {
      continue;
    }

    // Check if user's role meets or exceeds minimum required role
    if (userRoleIndex >= minimumRoleIndex) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user is a super admin
 */
export function isSuperAdmin(roles: UserRole[]): boolean {
  return roles.some((r) => r.role === "super_admin");
}

/**
 * Check if user is a club admin (for any club or specific club)
 */
export function isClubAdmin(roles: UserRole[], clubId?: string): boolean {
  if (isSuperAdmin(roles)) return true;
  return hasRole(roles, "club_admin", clubId);
}

/**
 * Check if user is a coach (for any club or specific club)
 */
export function isCoach(roles: UserRole[], clubId?: string): boolean {
  if (isSuperAdmin(roles)) return true;
  return hasRole(roles, "coach", clubId);
}

/**
 * Check if user is a parent (for any club or specific club)
 */
export function isParent(roles: UserRole[], clubId?: string): boolean {
  if (isSuperAdmin(roles)) return true;
  return hasRole(roles, "parent", clubId);
}

/**
 * Get all club IDs the user has access to
 */
export function getUserClubIds(roles: UserRole[]): string[] {
  // Super admins have access to all clubs (handled by RLS)
  if (isSuperAdmin(roles)) {
    return [];
  }

  return roles
    .map((r) => r.club_id)
    .filter((id): id is string => id !== null);
}

/**
 * Check if user has access to a specific club
 */
export function hasClubAccess(roles: UserRole[], clubId: string): boolean {
  if (isSuperAdmin(roles)) return true;
  return roles.some((r) => r.club_id === clubId);
}

/**
 * Get user's highest role (by hierarchy)
 */
export function getHighestRole(roles: UserRole[]): RoleType | null {
  if (!roles.length) return null;

  let highestRoleIndex = -1;
  let highestRole: RoleType | null = null;

  for (const userRole of roles) {
    const roleIndex = ROLE_HIERARCHY.indexOf(userRole.role as RoleType);
    if (roleIndex > highestRoleIndex) {
      highestRoleIndex = roleIndex;
      highestRole = userRole.role as RoleType;
    }
  }

  return highestRole;
}
