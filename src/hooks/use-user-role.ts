"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "./use-user";
import type { Database } from "@/types/database.types";

type UserRole = Database["public"]["Tables"]["user_roles"]["Row"];

export interface UserRoleData {
  roles: UserRole[];
  isLoading: boolean;
  error: Error | null;
  // Convenience methods
  hasRole: (role: string, clubId?: string) => boolean;
  isSuperAdmin: () => boolean;
  isClubAdmin: (clubId?: string) => boolean;
  isCoach: (clubId?: string) => boolean;
  isParent: (clubId?: string) => boolean;
  clubIds: string[];
}

export function useUserRole(): UserRoleData {
  const { user, loading: userLoading } = useUser();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (userLoading) return;

      if (!user) {
        setRoles([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("user_roles")
          .select("*")
          .eq("user_id", user.id);

        if (fetchError) throw fetchError;

        setRoles(data || []);
        setError(null);
      } catch (err) {
        setError(err as Error);
        setRoles([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [user, userLoading, supabase]);

  // Helper: Check if user has a specific role
  const hasRole = (role: string, clubId?: string): boolean => {
    if (!roles.length) return false;

    if (clubId) {
      return roles.some((r) => r.role === role && r.club_id === clubId);
    }

    return roles.some((r) => r.role === role);
  };

  // Helper: Check if user is super admin
  const isSuperAdmin = (): boolean => {
    return hasRole("super_admin");
  };

  // Helper: Check if user is club admin
  const isClubAdmin = (clubId?: string): boolean => {
    return hasRole("club_admin", clubId);
  };

  // Helper: Check if user is coach
  const isCoach = (clubId?: string): boolean => {
    return hasRole("coach", clubId);
  };

  // Helper: Check if user is parent
  const isParent = (clubId?: string): boolean => {
    return hasRole("parent", clubId);
  };

  // Get all club IDs the user has access to
  const clubIds = roles.map((r) => r.club_id).filter((id): id is string => id !== null);

  return {
    roles,
    isLoading,
    error,
    hasRole,
    isSuperAdmin,
    isClubAdmin,
    isCoach,
    isParent,
    clubIds,
  };
}
