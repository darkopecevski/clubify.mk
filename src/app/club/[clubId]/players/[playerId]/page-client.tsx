"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/use-user-role";
import { Trash2, Plus, X } from "lucide-react";

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
  const router = useRouter();
  const { isSuperAdmin, isClubAdmin } = useUserRole();
  const [player, setPlayer] = useState<Player | null>(null);
  const [parents, setParents] = useState<Parent[]>([]);
  const [teams, setTeams] = useState<TeamAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAssignTeamModal, setShowAssignTeamModal] = useState(false);
  const [availableTeams, setAvailableTeams] = useState<{ id: string; name: string; age_group: string }[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [showRemoveTeamModal, setShowRemoveTeamModal] = useState(false);
  const [teamToRemove, setTeamToRemove] = useState<{ id: string; name: string } | null>(null);
  const [removingFromTeam, setRemovingFromTeam] = useState(false);

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

  const fetchAvailableTeams = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("teams")
      .select("id, name, age_group")
      .eq("club_id", clubId)
      .eq("is_active", true)
      .order("name");

    if (data) {
      // Filter out teams player is already assigned to
      const assignedTeamIds = teams.map((t) => t.team_id);
      const available = data.filter((team) => !assignedTeamIds.includes(team.id));
      setAvailableTeams(available);
    }
  };

  const handleAssignTeam = async (teamId: string) => {
    setAssigning(true);
    try {
      const response = await fetch(`/api/club/teams/${teamId}/players`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ player_id: playerId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign player to team");
      }

      // Refresh player data
      await fetchPlayerData();
      setShowAssignTeamModal(false);
    } catch (error) {
      console.error("Error assigning player to team:", error);
      alert(error instanceof Error ? error.message : "Failed to assign player to team");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveFromTeam = async () => {
    if (!teamToRemove) return;

    setRemovingFromTeam(true);
    try {
      const response = await fetch(`/api/club/team-players/${teamToRemove.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove player from team");
      }

      // Refresh player data
      await fetchPlayerData();
      setShowRemoveTeamModal(false);
      setTeamToRemove(null);
    } catch (error) {
      console.error("Error removing player from team:", error);
      alert(error instanceof Error ? error.message : "Failed to remove player from team");
    } finally {
      setRemovingFromTeam(false);
    }
  };

  const handleDelete = async () => {
    if (!player) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/club/players/${playerId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete player");
      }

      // Redirect to players list
      router.push(`/club/${clubId}/players`);
    } catch (error) {
      console.error("Error deleting player:", error);
      alert(error instanceof Error ? error.message : "Failed to delete player");
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

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
            <>
              <Link
                href={`/club/${clubId}/players/${playerId}/edit`}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Edit Player
              </Link>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="inline-flex items-center gap-2 rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </>
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
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Assignments
          </h2>
          {canEdit && (
            <button
              onClick={() => {
                fetchAvailableTeams();
                setShowAssignTeamModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Assign to Team
            </button>
          )}
        </div>
        {teams.length > 0 ? (
          <div className="space-y-2">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700"
              >
                <div className="flex-1">
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
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                      team.is_active
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                    }`}
                  >
                    {team.is_active ? "Active" : "Inactive"}
                  </span>
                  {canEdit && (
                    <button
                      onClick={() => {
                        setTeamToRemove({ id: team.id, name: team.team_name });
                        setShowRemoveTeamModal(true);
                      }}
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                      title="Remove from team"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
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

      {/* Remove from Team Confirmation Modal */}
      {showRemoveTeamModal && teamToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Remove from Team
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to remove{" "}
              <span className="font-semibold">
                {player?.first_name} {player?.last_name}
              </span>{" "}
              from{" "}
              <span className="font-semibold">{teamToRemove.name}</span>?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleRemoveFromTeam}
                disabled={removingFromTeam}
                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {removingFromTeam ? "Removing..." : "Remove"}
              </button>
              <button
                onClick={() => {
                  setShowRemoveTeamModal(false);
                  setTeamToRemove(null);
                }}
                disabled={removingFromTeam}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign to Team Modal */}
      {showAssignTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Assign to Team
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Select a team to assign {player?.first_name} to:
            </p>
            <div className="mt-4 max-h-64 space-y-2 overflow-y-auto">
              {availableTeams.length > 0 ? (
                availableTeams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => handleAssignTeam(team.id)}
                    disabled={assigning}
                    className="flex w-full items-center justify-between rounded-md border border-gray-200 p-3 text-left hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{team.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{team.age_group}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No available teams. Player is already assigned to all active teams.
                </p>
              )}
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowAssignTeamModal(false)}
                disabled={assigning}
                className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Player
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {player.first_name} {player.last_name}
              </span>
              ? This will deactivate the player and they will no longer appear in active lists.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete Player"}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
