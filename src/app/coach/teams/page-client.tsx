"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  TrendingUp,
  Calendar,
  Trophy,
  ChevronDown,
  ChevronUp,
  Loader2,
  Building2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

type Player = {
  id: string;
  jersey_number: number | null;
  joined_at: string;
  player: {
    id: string;
    first_name: string;
    last_name: string;
    position: string | null;
    is_active: boolean;
  };
};

type Team = {
  id: string;
  name: string;
  age_group: string;
  season: string;
  is_active: boolean;
  club: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
  coach_role: string;
  player_count: number;
  active_player_count: number;
  avg_attendance: number | null;
  upcoming_training_count: number;
  upcoming_matches_count: number;
  players: Player[];
};

type SortOption = "name" | "age_group" | "player_count";

export default function TeamsPageClient() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("name");

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/coach/teams");

      if (!response.ok) {
        throw new Error("Failed to fetch teams");
      }

      const data = await response.json();
      setTeams(data.teams || []);
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError(err instanceof Error ? err.message : "Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const toggleRoster = (teamId: string) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  const getAttendanceColor = (percentage: number | null) => {
    if (percentage === null) return "text-gray-400";
    if (percentage >= 90) return "text-green-600 dark:text-green-400";
    if (percentage >= 75) return "text-yellow-600 dark:text-yellow-400";
    if (percentage >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getAttendanceBgColor = (percentage: number | null) => {
    if (percentage === null) return "bg-gray-100 dark:bg-gray-800";
    if (percentage >= 90) return "bg-green-50 dark:bg-green-900/20";
    if (percentage >= 75) return "bg-yellow-50 dark:bg-yellow-900/20";
    if (percentage >= 60) return "bg-orange-50 dark:bg-orange-900/20";
    return "bg-red-50 dark:bg-red-900/20";
  };

  const sortedTeams = [...teams].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "age_group":
        return (a.age_group || "").localeCompare(b.age_group || "");
      case "player_count":
        return b.player_count - a.player_count;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">Error loading teams</p>
        </div>
        <p className="mt-1 text-sm text-red-600 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <Users className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          No teams assigned
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          You don&apos;t have any teams assigned to you yet. Contact your club
          administrator to get assigned to teams.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Teams
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your assigned teams and view rosters
          </p>
        </div>

        {/* Sort dropdown */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="sort"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="name">Team Name</option>
            <option value="age_group">Age Group</option>
            <option value="player_count">Player Count</option>
          </select>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedTeams.map((team) => (
          <div
            key={team.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
          >
            {/* Team Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-bold">{team.name}</h3>
                  <p className="mt-1 text-sm text-green-100">
                    {team.age_group} • {team.season}
                  </p>
                </div>
                {team.club?.logo_url && (
                  <img
                    src={team.club.logo_url}
                    alt={team.club.name}
                    className="h-10 w-10 rounded-lg bg-white object-contain p-1"
                  />
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-sm font-medium">{team.coach_role}</span>
              </div>
            </div>

            {/* Stats Section */}
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-3">
                {/* Player Count */}
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Players
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {team.active_player_count}
                      {team.player_count !== team.active_player_count && (
                        <span className="text-sm font-normal text-gray-500">
                          /{team.player_count}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Attendance */}
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Attendance
                    </p>
                    <p
                      className={`text-lg font-semibold ${getAttendanceColor(team.avg_attendance)}`}
                    >
                      {team.avg_attendance !== null
                        ? `${team.avg_attendance}%`
                        : "N/A"}
                    </p>
                  </div>
                </div>

                {/* Upcoming Training */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Training
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {team.upcoming_training_count}
                    </p>
                  </div>
                </div>

                {/* Upcoming Matches */}
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Matches
                    </p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {team.upcoming_matches_count}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200 dark:divide-gray-700 dark:border-gray-700">
              <button
                onClick={() => router.push(`/coach/training?team=${team.id}`)}
                className="px-3 py-2.5 text-center text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Training
              </button>
              <button
                onClick={() => router.push(`/coach/attendance?team=${team.id}`)}
                className="px-3 py-2.5 text-center text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Attendance
              </button>
              <button
                onClick={() => router.push(`/coach/matches?team=${team.id}`)}
                className="px-3 py-2.5 text-center text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Matches
              </button>
            </div>

            {/* Roster Toggle */}
            <button
              onClick={() => toggleRoster(team.id)}
              className="flex w-full items-center justify-between p-4 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <span>View Roster ({team.player_count})</span>
              {expandedTeamId === team.id ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            {/* Roster List (Expandable) */}
            {expandedTeamId === team.id && (
              <div className="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/50">
                {team.players.length === 0 ? (
                  <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No players assigned to this team yet.
                  </p>
                ) : (
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                            #
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                            Position
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {team.players
                          .sort((a, b) => {
                            // Sort by jersey number, nulls last
                            if (a.jersey_number === null) return 1;
                            if (b.jersey_number === null) return -1;
                            return a.jersey_number - b.jersey_number;
                          })
                          .map((tp) => (
                            <tr
                              key={tp.id}
                              className={
                                tp.player.is_active
                                  ? ""
                                  : "opacity-50 grayscale"
                              }
                            >
                              <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">
                                {tp.jersey_number || "-"}
                              </td>
                              <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                {tp.player.first_name} {tp.player.last_name}
                                {!tp.player.is_active && (
                                  <span className="ml-2 text-xs text-gray-500">
                                    (Inactive)
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                {tp.player.position || "-"}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Club Info Footer (if all teams from same club) */}
      {teams.length > 0 && teams[0].club && (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Building2 className="h-4 w-4" />
          <span>{teams[0].club.name}</span>
        </div>
      )}
    </div>
  );
}
