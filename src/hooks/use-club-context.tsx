"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUserRole } from "./use-user-role";

type Club = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  logo_url: string | null;
};

type ClubContextType = {
  selectedClubId: string | null;
  selectedClub: Club | null;
  availableClubs: Club[];
  setSelectedClubId: (clubId: string) => void;
  loading: boolean;
  error: string | null;
};

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export function ClubProvider({ children }: { children: ReactNode }) {
  const { clubIds, roles, isLoading: rolesLoading } = useUserRole();
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [availableClubs, setAvailableClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is super admin
  const isSuperAdmin = roles.some((r) => r.role === "super_admin");

  useEffect(() => {
    async function fetchClubs() {
      if (rolesLoading) {
        return;
      }

      // Check if super admin has selected a club from admin panel
      const superAdminSelectedClub = localStorage.getItem("superAdminSelectedClub");

      try {
        const supabase = createClient();
        let query = supabase
          .from("clubs")
          .select("id, name, slug, city, logo_url")
          .eq("is_active", true)
          .order("name");

        // If super admin, fetch all clubs. Otherwise, fetch only assigned clubs
        if (!isSuperAdmin) {
          if (clubIds.length === 0) {
            setLoading(false);
            return;
          }
          query = query.in("id", clubIds);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        setAvailableClubs(data || []);

        // If super admin selected a club from admin panel, use that
        if (isSuperAdmin && superAdminSelectedClub && data) {
          const club = data.find((c) => c.id === superAdminSelectedClub);
          if (club) {
            setSelectedClubId(club.id);
            setSelectedClub(club);
            // Clear the stored selection after use
            localStorage.removeItem("superAdminSelectedClub");
          }
        }
        // Auto-select first club if none selected
        else if (!selectedClubId && data && data.length > 0) {
          setSelectedClubId(data[0].id);
          setSelectedClub(data[0]);
        } else if (selectedClubId && data) {
          const club = data.find((c) => c.id === selectedClubId);
          if (club) setSelectedClub(club);
        }
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    fetchClubs();
  }, [clubIds, rolesLoading, selectedClubId, isSuperAdmin, roles]);

  const handleSetSelectedClubId = (clubId: string) => {
    setSelectedClubId(clubId);
    const club = availableClubs.find((c) => c.id === clubId);
    if (club) setSelectedClub(club);
  };

  return (
    <ClubContext.Provider
      value={{
        selectedClubId,
        selectedClub,
        availableClubs,
        setSelectedClubId: handleSetSelectedClubId,
        loading,
        error,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
}

export function useClubContext() {
  const context = useContext(ClubContext);
  if (context === undefined) {
    throw new Error("useClubContext must be used within a ClubProvider");
  }
  return context;
}
