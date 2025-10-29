"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Calendar,
  TrendingUp,
  Clock,
  MapPin,
  Trophy,
  Loader2,
  UserCircle,
} from "lucide-react";

type Child = {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  photo_url: string | null;
  is_active: boolean;
  relationship: string;
  club: { id: string; name: string } | null;
  teams: Array<{ id: string; name: string; age_group: string | null }>;
};

type TrainingSession = {
  id: string;
  session_date: string;
  start_time: string;
  duration_minutes: number;
  location: string | null;
  teams: { id: string; name: string; age_group: string | null };
};

type Match = {
  id: string;
  match_date: string;
  match_time: string;
  away_team_name: string;
  venue: string | null;
  competition_type: string;
  teams: { id: string; name: string; age_group: string | null };
};

type AttendanceRecord = {
  id: string;
  status: string;
  arrival_time: string | null;
  notes: string | null;
  training_sessions: {
    id: string;
    session_date: string;
    start_time: string;
    teams: { id: string; name: string };
  };
};

export default function ParentDashboardClient() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [upcomingTraining, setUpcomingTraining] = useState<TrainingSession[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<{
    totalSessions: number;
    present: number;
    attendancePercentage: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (children.length > 0) {
      fetchDashboardData();
    }
  }, [selectedChildId, children]);

  async function fetchChildren() {
    try {
      const response = await fetch("/api/parent/children");
      if (!response.ok) throw new Error("Failed to fetch children");

      const data = await response.json();
      setChildren(data.children || []);

      // Auto-select first child if only one child
      if (data.children && data.children.length === 1) {
        setSelectedChildId(data.children[0].id);
      }
    } catch (error) {
      console.error("Error fetching children:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchDashboardData() {
    setDashboardLoading(true);
    try {
      const url = selectedChildId
        ? `/api/parent/dashboard?childId=${selectedChildId}`
        : "/api/parent/dashboard";

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch dashboard data");

      const data = await response.json();
      setUpcomingTraining(data.upcomingTraining || []);
      setUpcomingMatches(data.upcomingMatches || []);
      setRecentAttendance(data.recentAttendance || []);
      setAttendanceStats(data.attendanceStats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setDashboardLoading(false);
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

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  function formatTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "absent":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "late":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "excused":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "injured":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const selectedChild = children.find((c) => c.id === selectedChildId);
  const upcomingActivitiesCount = upcomingTraining.length + upcomingMatches.length;

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (children.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <UserCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
          No Children Linked
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          You don&apos;t have any children linked to your account yet.
          <br />
          Please contact your club administrator to link your children.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Parent Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          View your children&apos;s activities and progress
        </p>
      </div>

      {/* Child Selector (if multiple children) */}
      {children.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedChildId(null)}
            className={`flex-shrink-0 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
              selectedChildId === null
                ? "border-green-600 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            All Children
          </button>
          {children.map((child) => (
            <button
              key={child.id}
              onClick={() => setSelectedChildId(child.id)}
              className={`flex flex-shrink-0 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                selectedChildId === child.id
                  ? "border-green-600 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                  : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              }`}
            >
              {child.photo_url ? (
                <img
                  src={child.photo_url}
                  alt={child.first_name}
                  className="h-6 w-6 rounded-full object-cover"
                />
              ) : (
                <UserCircle className="h-6 w-6" />
              )}
              <span>
                {child.first_name} {child.last_name}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                My Children
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {selectedChildId ? "1" : children.length}
              </p>
            </div>
            <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Upcoming This Week
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {dashboardLoading ? "-" : upcomingActivitiesCount}
              </p>
            </div>
            <div className="rounded-lg bg-purple-100 p-3 dark:bg-purple-900/20">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Attendance Rate
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {dashboardLoading ? "-" : attendanceStats ? `${attendanceStats.attendancePercentage}%` : "N/A"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last 30 days</p>
            </div>
            <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Sessions
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {dashboardLoading ? "-" : attendanceStats?.totalSessions || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Last 30 days</p>
            </div>
            <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/20">
              <Trophy className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Activities */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Activities
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Next 7 days
          </p>
        </div>

        {dashboardLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : upcomingActivitiesCount === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              No upcoming activities this week
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {/* Training Sessions */}
            {upcomingTraining.map((session) => (
              <div key={session.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-blue-100 p-3 dark:bg-blue-900/20">
                    <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Training Session
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {session.teams.name}
                          {session.teams.age_group && ` (${session.teams.age_group})`}
                        </p>
                      </div>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        Training
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(session.session_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(session.start_time)} ({session.duration_minutes} min)
                      </div>
                      {session.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {session.location}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Matches */}
            {upcomingMatches.map((match) => (
              <div key={match.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/20">
                    <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Match vs {match.away_team_name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {match.teams.name}
                          {match.teams.age_group && ` (${match.teams.age_group})`}
                        </p>
                      </div>
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        Match
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(match.match_date)}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatTime(match.match_time)}
                      </div>
                      {match.venue && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {match.venue}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Attendance */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Attendance
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Last 10 training sessions
          </p>
        </div>

        {dashboardLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-green-600" />
          </div>
        ) : recentAttendance.length === 0 ? (
          <div className="p-8 text-center">
            <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              No attendance records yet
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {recentAttendance.map((record) => (
                  <tr key={record.id}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                      {formatDate(record.training_sessions.session_date)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {record.training_sessions.teams.name}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
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
