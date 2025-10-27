"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useUserRole } from "@/hooks/use-user-role";
import { Plus, X, Edit2, Users as UsersIcon } from "lucide-react";

type Team = {
  id: string;
  club_id: string;
  name: string;
  age_group: string;
  season: string | null;
  is_active: boolean;
  created_at: string;
};

type TeamPlayer = {
  id: string;
  player_id: string;
  jersey_number: number | null;
  joined_at: string;
  is_active: boolean;
  players: {
    id: string;
    first_name: string;
    last_name: string;
    date_of_birth: string;
    position: string | null;
  };
};

type AvailablePlayer = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  position: string | null;
};

type TeamCoach = {
  id: string;
  coach_id: string;
  role: string;
  coaches: {
    id: string;
    users: {
      full_name: string;
    } | null;
  } | null;
};

export default function TeamDetailPage({
  clubId,
  teamId,
}: {
  clubId: string;
  teamId: string;
}) {
  const { isSuperAdmin, isClubAdmin } = useUserRole();
  const [team, setTeam] = useState<Team | null>(null);
  const [roster, setRoster] = useState<TeamPlayer[]>([]);
  const [coaches, setCoaches] = useState<TeamCoach[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddPlayersModal, setShowAddPlayersModal] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<AvailablePlayer[]>([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);
  const [showRemovePlayerModal, setShowRemovePlayerModal] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState<{ id: string; name: string } | null>(null);
  const [removingPlayer, setRemovingPlayer] = useState(false);

  const canEdit = isSuperAdmin() || isClubAdmin(clubId);

  const fetchTeamData = useCallback(async () => {
    const supabase = createClient();

    // Fetch team info
    const { data: teamData, error: teamError } = await supabase
      .from("teams")
      .select("*")
      .eq("id", teamId)
      .single();

    if (teamError || !teamData) {
      console.error("Error fetching team:", teamError);
      setLoading(false);
      return;
    }

    setTeam(teamData);

    // Fetch roster
    const { data: rosterData, error: rosterError } = await supabase
      .from("team_players")
      .select(`
        *,
        players!inner (
          id,
          first_name,
          last_name,
          date_of_birth,
          position
        )
      `)
      .eq("team_id", teamId)
      .order("players(last_name)");

    if (rosterError) {
      console.error("Error fetching roster:", rosterError);
    } else if (rosterData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setRoster(rosterData as any);
    }

    // Fetch coaches
    const { data: coachesData, error: coachesError } = await supabase
      .from("team_coaches")
      .select(`
        id,
        coach_id,
        role,
        coaches!inner (
          id,
          users:user_id (
            full_name
          )
        )
      `)
      .eq("team_id", teamId)
      .eq("is_active", true);

    if (coachesError) {
      console.error("Error fetching coaches:", coachesError);
    } else if (coachesData) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCoaches(coachesData as any);
    }

    setLoading(false);
  }, [teamId]);

  useEffect(() => {
    fetchTeamData();
  }, [fetchTeamData]);

  const fetchAvailablePlayers = async () => {
    const supabase = createClient();

    // Get all players in the club
    const { data: allPlayers } = await supabase
      .from("players")
      .select("id, first_name, last_name, date_of_birth, position")
      .eq("club_id", clubId)
      .eq("is_active", true)
      .order("last_name");

    if (allPlayers) {
      // Filter out players already in the roster
      const rosterPlayerIds = roster.map((r) => r.player_id);
      const available = allPlayers.filter(
        (p) => !rosterPlayerIds.includes(p.id)
      );
      setAvailablePlayers(available);
    }
  };

  const handleAddPlayers = async () => {
    if (selectedPlayerIds.length === 0) return;

    setAssigning(true);
    try {
      // Assign each selected player to the team
      const promises = selectedPlayerIds.map((playerId) =>
        fetch(`/api/club/teams/${teamId}/players`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ player_id: playerId }),
        })
      );

      const results = await Promise.all(promises);
      const failedCount = results.filter((r) => !r.ok).length;

      if (failedCount > 0) {
        alert(
          `${failedCount} player(s) could not be added. Please try again.`
        );
      }

      // Refresh roster
      await fetchTeamData();
      setShowAddPlayersModal(false);
      setSelectedPlayerIds([]);
    } catch (error) {
      console.error("Error adding players:", error);
      alert("Failed to add players to team");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemovePlayer = async () => {
    if (!playerToRemove) return;

    setRemovingPlayer(true);
    try {
      const response = await fetch(
        `/api/club/team-players/${playerToRemove.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error("Failed to remove player");
      }

      // Refresh roster
      await fetchTeamData();
      setShowRemovePlayerModal(false);
      setPlayerToRemove(null);
    } catch (error) {
      console.error("Error removing player:", error);
      alert("Failed to remove player from team");
    } finally {
      setRemovingPlayer(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">
          Loading team details...
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Team not found</p>
          <Link
            href={`/club/${clubId}/teams`}
            className="mt-4 inline-block text-green-600 hover:text-green-700 dark:text-green-400"
          >
            Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {team.name}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {team.age_group} • {team.season}
          </p>
        </div>
        <div className="flex gap-3">
          {canEdit && (
            <Link
              href={`/club/${clubId}/teams/${teamId}/edit`}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Edit Team
            </Link>
          )}
          <Link
            href={`/club/${clubId}/teams`}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Back to Teams
          </Link>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
            team.is_active
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {team.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Coaches Section */}
      {coaches.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Coaching Staff
          </h2>
          <div className="space-y-2">
            {coaches.map((teamCoach) => {
              const formatRoleName = (role: string) => {
                return role
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ");
              };

              const getRoleBadgeColor = (role: string) => {
                switch (role) {
                  case "head_coach":
                    return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
                  case "assistant_coach":
                    return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
                  case "goalkeeper_coach":
                    return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
                  case "fitness_coach":
                    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
                  default:
                    return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
                }
              };

              return (
                <div
                  key={teamCoach.id}
                  className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700"
                >
                  <Link
                    href={`/club/${clubId}/coaches/${teamCoach.coach_id}`}
                    className="font-medium text-gray-900 hover:text-green-600 dark:text-white dark:hover:text-green-400"
                  >
                    {teamCoach.coaches?.users?.full_name || "Unknown Coach"}
                  </Link>
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeColor(
                      teamCoach.role
                    )}`}
                  >
                    {formatRoleName(teamCoach.role)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Roster Section */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Team Roster
            </h2>
            <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              {roster.length} players
            </span>
          </div>
          {canEdit && (
            <button
              onClick={() => {
                fetchAvailablePlayers();
                setShowAddPlayersModal(true);
              }}
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Add Players
            </button>
          )}
        </div>

        {roster.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Player
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Age
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Jersey #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Joined
                  </th>
                  {canEdit && (
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {roster.map((teamPlayer) => (
                  <tr
                    key={teamPlayer.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="whitespace-nowrap px-4 py-4">
                      <Link
                        href={`/club/${clubId}/players/${teamPlayer.player_id}`}
                        className="font-medium text-green-600 hover:text-green-700 dark:text-green-400"
                      >
                        {teamPlayer.players.first_name}{" "}
                        {teamPlayer.players.last_name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {calculateAge(teamPlayer.players.date_of_birth)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {teamPlayer.players.position || "N/A"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {teamPlayer.jersey_number || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {new Date(teamPlayer.joined_at).toLocaleDateString()}
                    </td>
                    {canEdit && (
                      <td className="whitespace-nowrap px-4 py-4 text-right">
                        <button
                          onClick={() => {
                            setPlayerToRemove({
                              id: teamPlayer.id,
                              name: `${teamPlayer.players.first_name} ${teamPlayer.players.last_name}`,
                            });
                            setShowRemovePlayerModal(true);
                          }}
                          className="text-red-600 hover:text-red-700 dark:text-red-400"
                          title="Remove from team"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-12 text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
              No players yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding players to this team
            </p>
            {canEdit && (
              <button
                onClick={() => {
                  fetchAvailablePlayers();
                  setShowAddPlayersModal(true);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Add Players
              </button>
            )}
          </div>
        )}
      </div>

      {/* Remove Player Confirmation Modal */}
      {showRemovePlayerModal && playerToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Remove Player from Team
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to remove{" "}
              <span className="font-semibold">{playerToRemove.name}</span> from{" "}
              <span className="font-semibold">{team?.name}</span>?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleRemovePlayer}
                disabled={removingPlayer}
                className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
              >
                {removingPlayer ? "Removing..." : "Remove Player"}
              </button>
              <button
                onClick={() => {
                  setShowRemovePlayerModal(false);
                  setPlayerToRemove(null);
                }}
                disabled={removingPlayer}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Players Modal */}
      {showAddPlayersModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Players to {team.name}
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Select players to add to this team:
            </p>
            <div className="mt-4 max-h-96 space-y-2 overflow-y-auto">
              {availablePlayers.length > 0 ? (
                availablePlayers.map((player) => (
                  <label
                    key={player.id}
                    className="flex cursor-pointer items-center gap-3 rounded-md border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedPlayerIds.includes(player.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPlayerIds([...selectedPlayerIds, player.id]);
                        } else {
                          setSelectedPlayerIds(
                            selectedPlayerIds.filter((id) => id !== player.id)
                          );
                        }
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {player.first_name} {player.last_name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Age: {calculateAge(player.date_of_birth)} •{" "}
                        {player.position || "No position"}
                      </p>
                    </div>
                  </label>
                ))
              ) : (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  No available players. All active players are already assigned to this team.
                </p>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleAddPlayers}
                disabled={assigning || selectedPlayerIds.length === 0}
                className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
              >
                {assigning
                  ? "Adding..."
                  : `Add ${selectedPlayerIds.length} Player${
                      selectedPlayerIds.length !== 1 ? "s" : ""
                    }`}
              </button>
              <button
                onClick={() => {
                  setShowAddPlayersModal(false);
                  setSelectedPlayerIds([]);
                }}
                disabled={assigning}
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
