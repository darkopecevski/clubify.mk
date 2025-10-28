"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, Award, AlertTriangle } from "lucide-react";

type Team = {
  id: string;
  name: string;
  age_group: string | null;
  club_id: string;
  clubs: {
    name: string;
  };
};

type PlayerStatistics = {
  player_id: string;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
  total: number;
  present: number;
  late: number;
  absent: number;
  excused: number;
  injured: number;
  percentage: number;
};

type OverallStats = {
  totalSessions: number;
  averageAttendance: number;
  perfectAttendance: number;
  lowAttendance: number;
};

export default function AttendanceClient({ teams }: { teams: Team[] }) {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statistics, setStatistics] = useState<PlayerStatistics[]>([]);
  const [overallStats, setOverallStats] = useState<OverallStats>({
    totalSessions: 0,
    averageAttendance: 0,
    perfectAttendance: 0,
    lowAttendance: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [selectedTeam, dateFrom, dateTo]);

  const fetchStatistics = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedTeam !== "all") {
        params.append("team_id", selectedTeam);
      }
      if (dateFrom) {
        params.append("date_from", dateFrom);
      }
      if (dateTo) {
        params.append("date_to", dateTo);
      }

      const res = await fetch(`/api/coach/attendance/statistics?${params}`);
      if (!res.ok) {
        throw new Error("Failed to fetch statistics");
      }

      const data = await res.json();
      setStatistics(data.statistics);
      setOverallStats(data.overall);
    } catch (err) {
      console.error("Error fetching attendance statistics:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600 dark:text-green-400";
    if (percentage >= 75) return "text-yellow-600 dark:text-yellow-400";
    if (percentage >= 60) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
  };

  const getAttendanceBadge = (percentage: number) => {
    if (percentage >= 90)
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (percentage >= 75)
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    if (percentage >= 60)
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Attendance Overview
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Track player attendance across all training sessions
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Team
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} {team.age_group && `(${team.age_group})`}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            From Date
          </label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            To Date
          </label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Sessions
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overallStats.totalSessions}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Attendance
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overallStats.averageAttendance}%
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
              <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Perfect Attendance
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overallStats.perfectAttendance}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
              <AlertTriangle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Low Attendance
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {overallStats.lowAttendance}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Player Statistics Table */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Player Attendance Statistics
          </h2>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Loading statistics...
          </div>
        ) : statistics.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No attendance data found for the selected filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Player
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Total
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Present
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Late
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Excused
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Injured
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Attendance %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {statistics.map((player) => (
                  <tr
                    key={player.player_id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {player.jersey_number || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {player.first_name} {player.last_name}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">
                      {player.total}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-green-600 dark:text-green-400">
                      {player.present}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-yellow-600 dark:text-yellow-400">
                      {player.late}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-red-600 dark:text-red-400">
                      {player.absent}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-blue-600 dark:text-blue-400">
                      {player.excused}
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-orange-600 dark:text-orange-400">
                      {player.injured}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {player.total > 0 ? (
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getAttendanceBadge(player.percentage)}`}
                        >
                          {player.percentage}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">N/A</span>
                      )}
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
