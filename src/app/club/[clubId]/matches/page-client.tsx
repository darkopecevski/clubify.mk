"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Calendar,
  MapPin,
  Plus,
  Loader2,
  AlertCircle,
  Edit2,
} from "lucide-react";
import ScheduleMatchModal from "@/components/matches/ScheduleMatchModal";
import EditMatchModal from "@/components/matches/EditMatchModal";
import MatchDetailModal from "@/components/matches/MatchDetailModal";

type Match = {
  id: string;
  home_team_id: string;
  away_team_id: string | null;
  away_team_name: string | null;
  match_date: string;
  start_time: string;
  location: string;
  competition: string | null;
  status: string;
  home_score: number | null;
  away_score: number | null;
  notes: string | null;
  created_at: string;
  teams: {
    id: string;
    name: string;
    age_group: string;
    clubs: {
      id: string;
      name: string;
    } | null;
  };
};

type Team = {
  id: string;
  name: string;
  age_group: string;
};

export default function MatchesPageClient({ clubId }: { clubId: string }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [selectedTeamId, setSelectedTeamId] = useState<string>("all");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);

  const [stats, setStats] = useState({
    totalMatches: 0,
    upcomingMatches: 0,
    completedMatches: 0,
  });

  useEffect(() => {
    fetchTeams();
    fetchMatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTeamId, clubId]);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`/api/club/${clubId}/teams`);
      if (!response.ok) throw new Error("Failed to fetch teams");

      const data = await response.json();
      setTeams(
        data.teams?.map((t: { id: string; name: string; age_group: string }) => ({
          id: t.id,
          name: t.name,
          age_group: t.age_group,
        })) || []
      );
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({ club_id: clubId });
      if (selectedTeamId && selectedTeamId !== "all") {
        queryParams.set("team_id", selectedTeamId);
      }

      const response = await fetch(`/api/matches?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch matches");

      const data = await response.json();
      const fetchedMatches = data.matches || [];
      setMatches(fetchedMatches);

      // Calculate stats
      const today = new Date().toISOString().split("T")[0];
      const upcoming = fetchedMatches.filter(
        (m: Match) => m.match_date >= today && m.status !== "cancelled"
      );
      const completed = fetchedMatches.filter((m: Match) => m.status === "completed");

      setStats({
        totalMatches: fetchedMatches.length,
        upcomingMatches: upcoming.length,
        completedMatches: completed.length,
      });
    } catch (err) {
      console.error("Error fetching matches:", err);
      setError(err instanceof Error ? err.message : "Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      scheduled:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      completed:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      cancelled:
        "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      live: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    };

    return (
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          statusStyles[status as keyof typeof statusStyles] || statusStyles.scheduled
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  const today = new Date().toISOString().split("T")[0];
  const upcomingMatches = matches.filter(
    (m) => m.match_date >= today && m.status !== "cancelled"
  );
  const pastMatches = matches.filter(
    (m) => m.match_date < today || m.status === "cancelled"
  );

  const displayedMatches = activeTab === "upcoming" ? upcomingMatches : pastMatches;

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
          <p className="font-medium">Error loading matches</p>
        </div>
        <p className="mt-1 text-sm text-red-600 dark:text-red-300">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Matches
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage matches for all club teams
          </p>
        </div>
        <button
          onClick={() => setShowScheduleModal(true)}
          className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
        >
          <Plus className="h-4 w-4" />
          Schedule Match
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Matches
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalMatches}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Trophy className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Upcoming
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.upcomingMatches}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <Calendar className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Completed
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {stats.completedMatches}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        {/* Team Filter */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="team-filter"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Team:
          </label>
          <select
            id="team-filter"
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Teams</option>
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name} ({team.age_group})
              </option>
            ))}
          </select>
        </div>

        {/* Tab Buttons */}
        <div className="ml-auto flex rounded-lg border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "upcoming"
                ? "bg-green-600 text-white dark:bg-green-500"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            } rounded-l-lg`}
          >
            Upcoming ({upcomingMatches.length})
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`border-l border-gray-300 px-4 py-2 text-sm font-medium transition-colors dark:border-gray-600 ${
              activeTab === "past"
                ? "bg-green-600 text-white dark:bg-green-500"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            } rounded-r-lg`}
          >
            Past ({pastMatches.length})
          </button>
        </div>
      </div>

      {/* Matches Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {displayedMatches.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
              No matches {activeTab === "upcoming" ? "scheduled" : "found"}
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {activeTab === "upcoming"
                ? "Schedule your first match to get started"
                : "No past matches to display"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Opponent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Competition
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
                {displayedMatches.map((match) => (
                  <tr
                    key={match.id}
                    className="cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    onClick={() => {
                      setSelectedMatch(match);
                      setShowDetailModal(true);
                    }}
                  >
                    {/* Date & Time */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {formatDate(match.match_date)}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {formatTime(match.start_time)}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Team */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {match.teams.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {match.teams.age_group}
                        </div>
                      </div>
                    </td>

                    {/* Opponent */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {match.away_team_name}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-300">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {match.location}
                      </div>
                    </td>

                    {/* Competition */}
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-700 dark:text-gray-300">
                        {match.competition || "-"}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-6 py-4">
                      {getStatusBadge(match.status)}
                    </td>

                    {/* Actions */}
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {match.status === "scheduled" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMatch(match);
                              setShowEditModal(true);
                            }}
                            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <ScheduleMatchModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        onSuccess={fetchMatches}
        teams={teams}
      />

      <EditMatchModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMatch(null);
        }}
        onSuccess={fetchMatches}
        match={selectedMatch}
      />

      <MatchDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedMatch(null);
        }}
        onEdit={() => {
          setShowDetailModal(false);
          setShowEditModal(true);
        }}
        onCancel={fetchMatches}
        match={selectedMatch}
      />
    </div>
  );
}
