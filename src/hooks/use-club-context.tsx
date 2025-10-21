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
  const { clubIds, isLoading: rolesLoading } = useUserRole();
  const [selectedClubId, setSelectedClubId] = useState<string | null>(null);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [availableClubs, setAvailableClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClubs() {
      if (rolesLoading || clubIds.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error: fetchError } = await supabase
          .from("clubs")
          .select("id, name, slug, city, logo_url")
          .in("id", clubIds)
          .eq("is_active", true)
          .order("name");

        if (fetchError) throw fetchError;

        setAvailableClubs(data || []);

        // Auto-select first club if none selected
        if (!selectedClubId && data && data.length > 0) {
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
  }, [clubIds, rolesLoading, selectedClubId]);

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
