"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  TrendingUp,
  Calendar,
  Trophy,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

type Player = {
  id: string;
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

export default function TeamsPageClient() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalTeams: 0,
    totalPlayers: 0,
    avgAttendance: 0,
  });

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
      const fetchedTeams = data.teams || [];
      setTeams(fetchedTeams);

      // Calculate overall stats
      const totalPlayers = fetchedTeams.reduce(
        (sum: number, t: Team) => sum + t.active_player_count,
        0
      );
      const attendanceValues = fetchedTeams
        .map((t: Team) => t.avg_attendance)
        .filter((a: number | null) => a !== null) as number[];
      const avgAttendance =
        attendanceValues.length > 0
          ? Math.round(
              attendanceValues.reduce((sum, val) => sum + val, 0) /
                attendanceValues.length
            )
          : 0;

      setStats({
        totalTeams: fetchedTeams.length,
        totalPlayers,
        avgAttendance,
      });
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
    if (percentage === null) return "text-gray-500 dark:text-gray-400";
    if (percentage >= 90) return "text-green-600 dark:text-green-400";
    if (percentage >= 75) return "text-yellow-600 dark:text-yellow-400";
    if (percentage >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            My Teams
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your assigned teams
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
            No teams assigned
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            You don&apos;t have any teams assigned to you yet. Contact your club
            administrator to get assigned to teams.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Teams
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your assigned teams and view rosters
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Teams
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalTeams}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Players
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalPlayers}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Attendance
              </p>
              <p
                className={`mt-2 text-3xl font-bold ${getAttendanceColor(stats.avgAttendance)}`}
              >
                {stats.avgAttendance > 0 ? `${stats.avgAttendance}%` : "N/A"}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Teams Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Players
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Attendance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Training
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Matches
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {teams.map((team) => (
                <>
                  <tr
                    key={team.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    {/* Team Name */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleRoster(team.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {expandedTeamId === team.id ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </button>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {team.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {team.age_group} • {team.season}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Coach Role */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {team.coach_role}
                      </span>
                    </td>

                    {/* Players */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {team.active_player_count}
                        </span>
                        {team.player_count !== team.active_player_count && (
                          <span className="text-gray-500">
                            /{team.player_count}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Attendance */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-1 text-sm">
                        <TrendingUp className="h-4 w-4 text-gray-400" />
                        <span
                          className={`font-medium ${getAttendanceColor(team.avg_attendance)}`}
                        >
                          {team.avg_attendance !== null
                            ? `${team.avg_attendance}%`
                            : "N/A"}
                        </span>
                      </div>
                    </td>

                    {/* Training Count */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{team.upcoming_training_count}</span>
                      </div>
                    </td>

                    {/* Matches Count */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-900 dark:text-white">
                        <Trophy className="h-4 w-4 text-gray-400" />
                        <span>{team.upcoming_matches_count}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            router.push(`/coach/training?team=${team.id}`)
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          Training
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/coach/attendance?team=${team.id}`)
                          }
                          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                          Attendance
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expandable Roster */}
                  {expandedTeamId === team.id && (
                    <tr key={`${team.id}-roster`}>
                      <td colSpan={7} className="bg-gray-50 dark:bg-gray-900/50">
                        <div className="px-6 py-4">
                          <h4 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
                            Team Roster ({team.player_count} players)
                          </h4>
                          {team.players.length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              No players assigned to this team yet.
                            </p>
                          ) : (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-gray-800">
                                  <tr>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                                      Name
                                    </th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                                      Position
                                    </th>
                                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                                      Status
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                  {team.players
                                    .sort((a, b) => {
                                      const nameA = `${a.player.first_name} ${a.player.last_name}`;
                                      const nameB = `${b.player.first_name} ${b.player.last_name}`;
                                      return nameA.localeCompare(nameB);
                                    })
                                    .map((tp) => (
                                      <tr
                                        key={tp.id}
                                        className="hover:bg-gray-100 dark:hover:bg-gray-800"
                                      >
                                        <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                                          {tp.player.first_name}{" "}
                                          {tp.player.last_name}
                                        </td>
                                        <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                                          {tp.player.position || "-"}
                                        </td>
                                        <td className="px-4 py-2">
                                          {tp.player.is_active ? (
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                              Active
                                            </span>
                                          ) : (
                                            <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                                              Inactive
                                            </span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
