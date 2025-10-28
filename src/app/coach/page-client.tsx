"use client";

import Link from "next/link";
import {
  Users,
  Calendar,
  Trophy,
  TrendingUp,
  Clock,
  MapPin,
  ChevronRight,
} from "lucide-react";

type Team = {
  id: string;
  name: string;
  age_group: string | null;
  season: string | null;
  role: string;
  club: {
    id: string;
    name: string;
    logo_url: string | null;
  } | null;
};

type TrainingSession = {
  id: string;
  session_date: string;
  start_time: string;
  duration_minutes: number;
  location: string | null;
  notes: string | null;
  teams: {
    id: string;
    name: string;
    age_group: string | null;
  };
};

type Match = {
  id: string;
  match_date: string;
  start_time: string;
  away_team_name: string | null;
  location: string;
  competition: string | null;
  status: string;
  teams: {
    id: string;
    name: string;
    age_group: string | null;
    clubs: {
      id: string;
      name: string;
    } | null;
  };
};

type AttendanceStats = {
  percentage: number;
  totalSessions: number;
};

export default function CoachDashboardClient({
  teams,
  upcomingTraining,
  upcomingMatches,
  attendanceStats,
}: {
  teams: Team[];
  upcomingTraining: TrainingSession[];
  upcomingMatches: Match[];
  attendanceStats: AttendanceStats;
}) {
  const formatRoleName = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5); // HH:MM
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Coach Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your teams, training sessions, and matches
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* My Teams */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                My Teams
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {teams.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Upcoming Training */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Training (7 days)
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {upcomingTraining.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Upcoming Matches */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Matches (7 days)
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {upcomingMatches.length}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Trophy className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        {/* Attendance Rate */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Attendance (30d)
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {attendanceStats.percentage}%
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {attendanceStats.totalSessions} sessions
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* My Teams */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            My Teams
          </h2>
          <Link
            href="/coach/teams"
            className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
          >
            View all →
          </Link>
        </div>

        {teams.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              You are not assigned to any teams yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {teams.map((team) => (
              <div
                key={team.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {team.name}
                  </h3>
                  <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    {team.club && <span>{team.club.name}</span>}
                    {team.age_group && (
                      <>
                        {team.club && <span>•</span>}
                        <span>{team.age_group}</span>
                      </>
                    )}
                    {team.season && (
                      <>
                        <span>•</span>
                        <span>{team.season}</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    {formatRoleName(team.role)}
                  </span>
                  <Link
                    href={`/coach/teams/${team.id}`}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Two columns: Training & Matches */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Training */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Training
            </h2>
            <Link
              href="/coach/training"
              className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              View all →
            </Link>
          </div>

          {upcomingTraining.length === 0 ? (
            <div className="py-8 text-center">
              <Calendar className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                No upcoming training sessions
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingTraining.map((session) => (
                <div
                  key={session.id}
                  className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {session.teams.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(session.session_date)}</span>
                        <span>•</span>
                        <span>
                          {formatTime(session.start_time)} -{" "}
                          {formatTime(calculateEndTime(session.start_time, session.duration_minutes))}
                        </span>
                      </div>
                      {session.location && (
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{session.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Matches */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Matches
            </h2>
            <Link
              href="/coach/matches"
              className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              View all →
            </Link>
          </div>

          {upcomingMatches.length === 0 ? (
            <div className="py-8 text-center">
              <Trophy className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                No upcoming matches
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingMatches.map((match) => (
                <div
                  key={match.id}
                  className="rounded-lg border border-gray-200 p-3 dark:border-gray-700"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {match.teams.clubs?.name} ({match.teams.name}) vs {match.away_team_name || "TBD"}
                        </h3>
                        {match.competition && (
                          <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400">
                            {match.competition}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(match.match_date)}</span>
                        {match.start_time && (
                          <>
                            <span>•</span>
                            <span>{formatTime(match.start_time)}</span>
                          </>
                        )}
                      </div>
                      {match.location && (
                        <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          <span>{match.location}</span>
                        </div>
                      )}
                      <div className="mt-1">
                        <span className="inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                          {match.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
