"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Plus, UserSquare2, Loader2, Users, Upload, Search } from "lucide-react";

type Team = {
  id: string;
  name: string;
  age_group: string;
};

type Player = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  position: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  teams?: Team[];
};

export default function PlayersPageClient({ clubId }: { clubId: string }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
  });

  // Filters
  const [selectedTeamId, setSelectedTeamId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("active");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchTeams();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId]);

  useEffect(() => {
    fetchPlayers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, selectedTeamId, selectedStatus, searchQuery]);

  async function fetchTeams() {
    const supabase = createClient();
    try {
      const { data, error } = await supabase
        .from("teams")
        .select("id, name, age_group")
        .eq("club_id", clubId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  }

  async function fetchPlayers() {
    setLoading(true);
    const supabase = createClient();

    try {
      // Build the base query
      let query = supabase
        .from("players")
        .select("*")
        .eq("club_id", clubId);

      // Apply status filter
      if (selectedStatus === "active") {
        query = query.eq("is_active", true);
      } else if (selectedStatus === "inactive") {
        query = query.eq("is_active", false);
      }
      // "all" doesn't need a filter

      // Apply search filter
      if (searchQuery.trim()) {
        const searchTerm = `%${searchQuery.trim()}%`;
        query = query.or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm}`);
      }

      query = query.order("created_at", { ascending: false });

      const { data: playersData, error: playersError } = await query;

      if (playersError) throw playersError;

      let filteredPlayers: Player[] = playersData || [];

      // Fetch team assignments with team details for all players
      if (filteredPlayers.length > 0) {
        const { data: teamAssignments, error: teamError } = await supabase
          .from("team_players")
          .select(`
            player_id,
            teams:team_id (
              id,
              name,
              age_group
            )
          `)
          .in("player_id", filteredPlayers.map((p) => p.id));

        if (teamError) {
          console.error("Error fetching team assignments:", teamError);
        }

        // Group teams by player
        const playerTeamsMap: Record<string, Team[]> = {};
        teamAssignments?.forEach((assignment: { player_id: string; teams: Team }) => {
          if (!playerTeamsMap[assignment.player_id]) {
            playerTeamsMap[assignment.player_id] = [];
          }
          playerTeamsMap[assignment.player_id].push(assignment.teams);
        });

        // Add teams to players
        filteredPlayers = filteredPlayers.map((player) => ({
          ...player,
          teams: playerTeamsMap[player.id] || [],
        }));

        // Apply team filter if selected
        if (selectedTeamId !== "all") {
          filteredPlayers = filteredPlayers.filter((player) =>
            player.teams?.some((team) => team.id === selectedTeamId)
          );
        }
      }

      setPlayers(filteredPlayers);

      // Calculate stats from ALL players (not filtered)
      const { data: allPlayers } = await supabase
        .from("players")
        .select("id, is_active")
        .eq("club_id", clubId);

      if (allPlayers) {
        setStats({
          total: allPlayers.length,
          active: allPlayers.filter((p) => p.is_active).length,
          inactive: allPlayers.filter((p) => !p.is_active).length,
        });
      }
    } catch (error) {
      console.error("Error fetching players:", error);
    } finally {
      setLoading(false);
    }
  }

  function calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Players
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your club&apos;s players
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/club/${clubId}/players/import`}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Link>
          <Link
            href={`/club/${clubId}/players/create`}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          >
            <Plus className="h-4 w-4" />
            Add Player
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Players
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <UserSquare2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Players
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.active}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <UserSquare2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Inactive Players
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.inactive}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
              <UserSquare2 className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Team Filter */}
          <div>
            <label
              htmlFor="team-filter"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Team
            </label>
            <select
              id="team-filter"
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400"
            >
              <option value="all">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} ({team.age_group})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label
              htmlFor="status-filter"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:focus:border-green-400 dark:focus:ring-green-400"
            >
              <option value="all">All Players</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                id="search"
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-green-400 dark:focus:ring-green-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Players Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : players.length === 0 ? (
          <div className="py-12 text-center">
            <UserSquare2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
              No players yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding your first player
            </p>
            <Link
              href={`/club/${clubId}/players/create`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <Plus className="h-4 w-4" />
              Add Player
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Age
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Teams
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {players.map((player) => (
                  <tr
                    key={player.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <Link
                        href={`/club/${clubId}/players/${player.id}`}
                        className="flex items-center gap-3 hover:opacity-80"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                          {player.first_name.charAt(0)}
                          {player.last_name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                            {player.first_name} {player.last_name}
                          </div>
                        </div>
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {calculateAge(player.date_of_birth)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {player.gender}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {player.position || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      {player.teams && player.teams.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {player.teams.map((team) => (
                            <span
                              key={team.id}
                              className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            >
                              {team.name}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 dark:text-gray-500">
                          No teams
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          player.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {player.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                      <Link
                        href={`/club/${clubId}/players/${player.id}`}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
