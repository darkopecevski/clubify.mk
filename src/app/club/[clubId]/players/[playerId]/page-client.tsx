"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useUserRole } from "@/hooks/use-user-role";

type Player = {
  id: string;
  club_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  position: string | null;
  dominant_foot: string | null;
  jersey_number: number | null;
  blood_type: string | null;
  medical_conditions: string | null;
  allergies: string | null;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relationship: string;
  photo_url: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
};

type Parent = {
  id: string;
  full_name: string;
  relationship: string;
};

type TeamAssignment = {
  id: string;
  team_id: string;
  team_name: string;
  joined_at: string;
  is_active: boolean;
};

type ParentData = {
  id: string;
  relationship: string;
  parent_user_id: string;
  users: {
    id: string;
    full_name: string;
  } | null;
};

type TeamData = {
  id: string;
  team_id: string;
  joined_at: string;
  is_active: boolean;
  teams: {
    id: string;
    name: string;
  } | null;
};

export default function PlayerProfilePage({
  clubId,
  playerId,
}: {
  clubId: string;
  playerId: string;
}) {
  const { isSuperAdmin, isClubAdmin } = useUserRole();
  const [player, setPlayer] = useState<Player | null>(null);
  const [parents, setParents] = useState<Parent[]>([]);
  const [teams, setTeams] = useState<TeamAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  const canEdit = isSuperAdmin() || isClubAdmin(clubId);

  const fetchPlayerData = useCallback(async () => {
    const supabase = createClient();

    // Fetch player data
    const { data: playerData, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("id", playerId)
      .single();

    if (playerError || !playerData) {
      console.error("Error fetching player:", playerError);
      setLoading(false);
      return;
    }

    setPlayer(playerData);

    // Fetch parent data
    const { data: parentsData } = await supabase
      .from("player_parents")
      .select(`
        id,
        relationship,
        parent_user_id,
        users!player_parents_parent_user_id_fkey (
          id,
          full_name
        )
      `)
      .eq("player_id", playerId);

    if (parentsData) {
      const formattedParents = parentsData.map((p: ParentData) => ({
        id: p.parent_user_id,
        full_name: p.users?.full_name || "Unknown",
        relationship: p.relationship,
      }));
      setParents(formattedParents);
    }

    // Fetch team assignments
    const { data: teamsData } = await supabase
      .from("team_players")
      .select(`
        id,
        team_id,
        joined_at,
        is_active,
        teams (
          id,
          name
        )
      `)
      .eq("player_id", playerId);

    if (teamsData) {
      const formattedTeams = teamsData.map((t: TeamData) => ({
        id: t.id,
        team_id: t.team_id,
        team_name: t.teams?.name || "Unknown Team",
        joined_at: t.joined_at,
        is_active: t.is_active,
      }));
      setTeams(formattedTeams);
    }

    setLoading(false);
  }, [playerId]);

  useEffect(() => {
    fetchPlayerData();
  }, [fetchPlayerData]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Loading player profile...</div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Player not found</p>
          <Link
            href={`/club/${clubId}/players`}
            className="mt-4 inline-block text-green-600 hover:text-green-700 dark:text-green-400"
          >
            Back to Players
          </Link>
        </div>
      </div>
    );
  }

  const age = new Date().getFullYear() - new Date(player.date_of_birth).getFullYear();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {player.first_name} {player.last_name}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Player Profile
          </p>
        </div>
        <div className="flex gap-3">
          {canEdit && (
            <Link
              href={`/club/${clubId}/players/${playerId}/edit`}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Edit Player
            </Link>
          )}
          <Link
            href={`/club/${clubId}/players`}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Back to Players
          </Link>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
            player.is_active
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {player.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Personal Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {player.first_name} {player.last_name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Date of Birth</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(player.date_of_birth).toLocaleDateString()} ({age} years old)
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Gender</dt>
              <dd className="mt-1 text-sm capitalize text-gray-900 dark:text-white">
                {player.gender}
              </dd>
            </div>
          </dl>
        </div>

        {/* Football Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Football Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {player.position || "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Dominant Foot</dt>
              <dd className="mt-1 text-sm capitalize text-gray-900 dark:text-white">
                {player.dominant_foot || "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Jersey Number</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {player.jersey_number || "Not assigned"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Medical Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Medical Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Blood Type</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {player.blood_type || "Not specified"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Allergies</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {player.allergies || "None"}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Medical Conditions</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {player.medical_conditions || "None"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Emergency Contact */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Emergency Contact
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {player.emergency_contact_name}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {player.emergency_contact_phone}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Relationship</dt>
              <dd className="mt-1 text-sm capitalize text-gray-900 dark:text-white">
                {player.emergency_contact_relationship}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Parents/Guardians */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Parents / Guardians
        </h2>
        {parents.length > 0 ? (
          <div className="space-y-2">
            {parents.map((parent) => (
              <div
                key={parent.id}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {parent.full_name}
                  </p>
                  <p className="text-sm capitalize text-gray-500 dark:text-gray-400">
                    {parent.relationship}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">No parents/guardians assigned</p>
        )}
      </div>

      {/* Team Assignments */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
          Team Assignments
        </h2>
        {teams.length > 0 ? (
          <div className="space-y-2">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700"
              >
                <div>
                  <Link
                    href={`/club/${clubId}/teams/${team.team_id}`}
                    className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400"
                  >
                    {team.team_name}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Joined: {new Date(team.joined_at).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    team.is_active
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                  }`}
                >
                  {team.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Not assigned to any team yet
          </p>
        )}
      </div>

      {/* Notes */}
      {player.notes && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Notes</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300">{player.notes}</p>
        </div>
      )}
    </div>
  );
}
