"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Repeat,
  Filter,
  Trash2,
  Edit,
  List,
  X,
  Users,
  UserCheck,
  CheckCircle,
} from "lucide-react";
import TrainingCalendar from "@/components/coach/TrainingCalendar";

type Team = {
  id: string;
  name: string;
  age_group: string | null;
  season: string | null;
  club: {
    id: string;
    name: string;
  } | null;
};

type TrainingSession = {
  id: string;
  session_date: string;
  start_time: string;
  duration_minutes: number;
  location: string | null;
  notes: string | null;
  recurrence_id: string | null;
  is_override?: boolean;
  teams: {
    id: string;
    name: string;
    age_group: string | null;
  };
};

export default function TrainingListClient({
  teams,
  upcomingSessions,
  pastSessions,
}: {
  teams: Team[];
  upcomingSessions: TrainingSession[];
  pastSessions: TrainingSession[];
}) {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("all");
  const [showPastSessions, setShowPastSessions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<TrainingSession | null>(
    null
  );
  const [deleteMode, setDeleteMode] = useState<"single" | "all_future">("single");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<TrainingSession | null>(
    null
  );
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceData, setAttendanceData] = useState<
    Array<{
      player_id: string;
      first_name: string;
      last_name: string;
      jersey_number: number | null;
      status: string | null;
      arrival_time: string | null;
      notes: string | null;
    }>
  >([]);
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Handle edit from sessionStorage (when navigating from details page)
  useEffect(() => {
    const editSessionId = sessionStorage.getItem('editSessionId');
    if (editSessionId) {
      // Find the session to edit
      const session = [...upcomingSessions, ...pastSessions].find(
        (s) => s.id === editSessionId
      );
      if (session) {
        handleEditSession(session);
        // Clear the sessionStorage
        sessionStorage.removeItem('editSessionId');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Form state
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [location, setLocation] = useState("");
  const [notes, setNotes] = useState("");

  // Recurring form state
  const [recurringTeam, setRecurringTeam] = useState("");
  const [recurringDays, setRecurringDays] = useState<number[]>([]);
  const [recurringStartTime, setRecurringStartTime] = useState("");
  const [recurringEndTime, setRecurringEndTime] = useState("");
  const [recurringLocation, setRecurringLocation] = useState("");
  const [recurringNotes, setRecurringNotes] = useState("");
  const [generateUntil, setGenerateUntil] = useState("");

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
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

  // Filter sessions by team
  const filterSessions = (sessions: TrainingSession[]) => {
    if (selectedTeamFilter === "all") return sessions;
    return sessions.filter((s) => s.teams.id === selectedTeamFilter);
  };

  const filteredUpcoming = filterSessions(upcomingSessions);
  const filteredPast = filterSessions(pastSessions);

  const handleScheduleTraining = async () => {
    if (!selectedTeam || !date || !startTime || !endTime) {
      setError("Please fill in all required fields");
      return;
    }

    if (startTime >= endTime) {
      setError("End time must be after start time");
      return;
    }

    // Calculate duration in minutes
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;

    if (durationMinutes <= 0) {
      setError("End time must be after start time");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const url = editingSessionId
        ? `/api/coach/training/${editingSessionId}`
        : "/api/coach/training";
      const method = editingSessionId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: selectedTeam,
          session_date: date,
          start_time: startTime,
          duration_minutes: durationMinutes,
          location: location || null,
          notes: notes || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error ||
            `Failed to ${editingSessionId ? "update" : "schedule"} training`
        );
      }

      // Reset form
      setEditingSessionId(null);
      setSelectedTeam("");
      setDate("");
      setStartTime("");
      setEndTime("");
      setLocation("");
      setNotes("");
      setShowScheduleModal(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${editingSessionId ? "update" : "schedule"} training`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSession = (session: TrainingSession) => {
    setEditingSessionId(session.id);
    setSelectedTeam(session.teams.id);
    setDate(session.session_date);
    setStartTime(session.start_time);
    setEndTime(calculateEndTime(session.start_time, session.duration_minutes));
    setLocation(session.location || "");
    setNotes(session.notes || "");
    setShowScheduleModal(true);
  };

  const handleDeleteClick = (session: TrainingSession) => {
    setSessionToDelete(session);
    setDeleteMode("single");
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/coach/training/${sessionToDelete.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delete_mode: deleteMode }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete session");
      }

      setShowDeleteModal(false);
      setSessionToDelete(null);
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to delete session");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDayToggle = (day: number) => {
    setRecurringDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleMarkAttendance = async (session: TrainingSession) => {
    try {
      const res = await fetch(
        `/api/coach/training/${session.id}/attendance`,
        {
          method: "GET",
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch attendance data");
      }

      const data = await res.json();
      setAttendanceData(data.attendance);
      setSelectedSession(session);
      setShowDetailModal(false);
      setShowAttendanceModal(true);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to load attendance");
    }
  };

  const handleAttendanceChange = (
    playerId: string,
    field: "status" | "arrival_time" | "notes",
    value: string
  ) => {
    setAttendanceData((prev) =>
      prev.map((record) =>
        record.player_id === playerId ? { ...record, [field]: value } : record
      )
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedSession) return;

    setIsSavingAttendance(true);

    try {
      const res = await fetch(
        `/api/coach/training/${selectedSession.id}/attendance`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            attendance: attendanceData.map((record) => ({
              player_id: record.player_id,
              status: record.status,
              arrival_time: record.arrival_time,
              notes: record.notes,
            })),
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save attendance");
      }

      setShowAttendanceModal(false);
      setAttendanceData([]);
      setSuccessMessage("Attendance saved successfully!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save attendance");
    } finally {
      setIsSavingAttendance(false);
    }
  };

  const handleCreateRecurring = async () => {
    if (
      !recurringTeam ||
      recurringDays.length === 0 ||
      !recurringStartTime ||
      !recurringEndTime ||
      !generateUntil
    ) {
      setError("Please fill in all required fields");
      return;
    }

    if (recurringStartTime >= recurringEndTime) {
      setError("End time must be after start time");
      return;
    }

    // Calculate duration
    const [startHours, startMinutes] = recurringStartTime.split(":").map(Number);
    const [endHours, endMinutes] = recurringEndTime.split(":").map(Number);
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;
    const durationMinutes = endTotalMinutes - startTotalMinutes;

    if (durationMinutes <= 0) {
      setError("End time must be after start time");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/coach/training/recurring", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          team_id: recurringTeam,
          days_of_week: recurringDays,
          start_time: recurringStartTime,
          duration_minutes: durationMinutes,
          location: recurringLocation || null,
          notes: recurringNotes || null,
          generate_until: generateUntil,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create recurring training");
      }

      // Reset form
      setRecurringTeam("");
      setRecurringDays([]);
      setRecurringStartTime("");
      setRecurringEndTime("");
      setRecurringLocation("");
      setRecurringNotes("");
      setGenerateUntil("");
      setShowRecurringModal(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create recurring training"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Training Sessions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage training schedules for your teams
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRecurringModal(true)}
            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Repeat className="h-4 w-4" />
            Recurring
          </button>
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
          >
            <Plus className="h-4 w-4" />
            Schedule Training
          </button>
        </div>
      </div>

      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setViewMode("calendar")}
            className={`flex items-center gap-2 rounded-l-lg px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "calendar"
                ? "bg-green-600 text-white dark:bg-green-500"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <CalendarIcon className="h-4 w-4" />
            Calendar
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 rounded-r-lg border-l border-gray-300 px-4 py-2 text-sm font-medium transition-colors dark:border-gray-600 ${
              viewMode === "list"
                ? "bg-green-600 text-white dark:bg-green-500"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            <List className="h-4 w-4" />
            List
          </button>
        </div>

        {/* Filters (only show in list view) */}
        {viewMode === "list" && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Filter by team:</span>
            </div>
            <select
              value={selectedTeamFilter}
              onChange={(e) => setSelectedTeamFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-green-400"
            >
              <option value="all">All Teams</option>
              {teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} {team.age_group ? `(${team.age_group})` : ""}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* No teams message */}
      {teams.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-800">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            You are not assigned to any teams yet
          </p>
        </div>
      )}

      {/* Calendar View */}
      {teams.length > 0 && viewMode === "calendar" && (
        <TrainingCalendar
          sessions={[...upcomingSessions, ...pastSessions]}
          onSessionClick={(session) => {
            router.push(`/coach/training/${session.id}`);
          }}
          onCreateSession={(date, time) => {
            // Open schedule modal with pre-filled date and time
            setDate(date);
            if (time) {
              setStartTime(time);
              // Set end time to 1.5 hours later by default
              const [hours, minutes] = time.split(":").map(Number);
              const endMinutes = hours * 60 + minutes + 90;
              const endHours = Math.floor(endMinutes / 60) % 24;
              const endMins = endMinutes % 60;
              setEndTime(`${endHours.toString().padStart(2, "0")}:${endMins.toString().padStart(2, "0")}`);
            }
            setShowScheduleModal(true);
          }}
        />
      )}

      {/* List View - Upcoming Sessions */}
      {teams.length > 0 && viewMode === "list" && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Upcoming Sessions
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {filteredUpcoming.length} session
              {filteredUpcoming.length !== 1 ? "s" : ""} scheduled
            </p>
          </div>

          {filteredUpcoming.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon className="mx-auto h-10 w-10 text-gray-400" />
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                No upcoming training sessions
              </p>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Schedule Training
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUpcoming.map((session) => (
                <div
                  key={session.id}
                  onClick={() => router.push(`/coach/training/${session.id}`)}
                  className="p-6 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {session.teams.name}
                        {session.teams.age_group && (
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            ({session.teams.age_group})
                          </span>
                        )}
                      </h3>
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <CalendarIcon className="h-4 w-4" />
                          <span>{formatDate(session.session_date)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatTime(session.start_time)} -{" "}
                            {formatTime(calculateEndTime(session.start_time, session.duration_minutes))}
                          </span>
                        </div>
                        {session.location && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                            <MapPin className="h-4 w-4" />
                            <span>{session.location}</span>
                          </div>
                        )}
                      </div>
                      {session.notes && (
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          {session.notes}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAttendance(session);
                        }}
                        className="rounded-lg p-2 text-gray-400 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400"
                        title="Mark Attendance"
                      >
                        <UserCheck className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditSession(session);
                        }}
                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-600 dark:hover:text-gray-300"
                        title="Edit Session"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(session);
                        }}
                        className="rounded-lg p-2 text-red-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                        title="Delete Session"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Past Sessions Toggle - Only in List View */}
      {teams.length > 0 && viewMode === "list" && filteredPast.length > 0 && (
        <button
          onClick={() => setShowPastSessions(!showPastSessions)}
          className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          {showPastSessions ? "Hide" : "Show"} Past Sessions (
          {filteredPast.length})
        </button>
      )}

      {/* Past Sessions - Only in List View */}
      {teams.length > 0 && viewMode === "list" && showPastSessions && filteredPast.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="border-b border-gray-200 p-6 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Past Sessions
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredPast.map((session) => (
              <div
                key={session.id}
                onClick={() => router.push(`/coach/training/${session.id}`)}
                className="p-6 opacity-75 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {session.teams.name}
                      {session.teams.age_group && (
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          ({session.teams.age_group})
                        </span>
                      )}
                    </h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{formatDate(session.session_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatTime(session.start_time)} -{" "}
                          {formatTime(calculateEndTime(session.start_time, session.duration_minutes))}
                        </span>
                      </div>
                      {session.location && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <MapPin className="h-4 w-4" />
                          <span>{session.location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingSessionId ? "Edit Training Session" : "Schedule Training Session"}
            </h3>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="mt-4 space-y-4">
              {/* Team Selection */}
              <div>
                <label
                  htmlFor="team"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Team *
                </label>
                <select
                  id="team"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-green-400"
                >
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} {team.age_group ? `(${team.age_group})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label
                  htmlFor="date"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-green-400"
                />
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Start Time *
                  </label>
                  <input
                    type="time"
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-green-400"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endTime"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    End Time *
                  </label>
                  <input
                    type="time"
                    id="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-green-400"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Main Stadium, Training Ground A"
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-400"
                />
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any notes or special instructions..."
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-400"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setEditingSessionId(null);
                  setError("");
                  setSelectedTeam("");
                  setDate("");
                  setStartTime("");
                  setEndTime("");
                  setLocation("");
                  setNotes("");
                }}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleScheduleTraining}
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
              >
                {isSubmitting
                  ? editingSessionId
                    ? "Updating..."
                    : "Scheduling..."
                  : editingSessionId
                    ? "Update"
                    : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Modal */}
      {showRecurringModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create Recurring Training
            </h3>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="mt-4 space-y-4">
              {/* Team Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Team *
                </label>
                <select
                  value={recurringTeam}
                  onChange={(e) => setRecurringTeam(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-green-400"
                >
                  <option value="">Select a team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} {team.age_group ? `(${team.age_group})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Days of Week */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Days of Week *
                </label>
                <div className="mt-1.5 grid grid-cols-7 gap-2">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (day, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleDayToggle(index)}
                        className={`rounded-lg px-2 py-2 text-xs font-medium transition-colors ${
                          recurringDays.includes(index)
                            ? "bg-green-600 text-white dark:bg-green-500"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                        }`}
                      >
                        {day}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    value={recurringStartTime}
                    onChange={(e) => setRecurringStartTime(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    End Time *
                  </label>
                  <input
                    type="time"
                    value={recurringEndTime}
                    onChange={(e) => setRecurringEndTime(e.target.value)}
                    className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-green-400"
                  />
                </div>
              </div>

              {/* Generate Until */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Generate Sessions Until *
                </label>
                <input
                  type="date"
                  value={generateUntil}
                  onChange={(e) => setGenerateUntil(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-green-400"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Training sessions will be created on selected days until this date
                </p>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Location
                </label>
                <input
                  type="text"
                  value={recurringLocation}
                  onChange={(e) => setRecurringLocation(e.target.value)}
                  placeholder="e.g., Main Stadium, Training Ground A"
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-400"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Notes
                </label>
                <textarea
                  value={recurringNotes}
                  onChange={(e) => setRecurringNotes(e.target.value)}
                  rows={2}
                  placeholder="Add any notes..."
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-400"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowRecurringModal(false);
                  setError("");
                  setRecurringTeam("");
                  setRecurringDays([]);
                  setRecurringStartTime("");
                  setRecurringEndTime("");
                  setRecurringLocation("");
                  setRecurringNotes("");
                  setGenerateUntil("");
                }}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRecurring}
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
              >
                {isSubmitting ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Detail Modal */}
      {showDetailModal && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Training Session Details
              </h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedSession(null);
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Team */}
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Team
                  </p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">
                    {selectedSession.teams.name}
                    {selectedSession.teams.age_group && (
                      <span className="ml-2 text-sm font-normal text-gray-600 dark:text-gray-400">
                        {selectedSession.teams.age_group}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Date & Time */}
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Date & Time
                  </p>
                  <p className="text-base text-gray-900 dark:text-white">
                    {formatDate(selectedSession.session_date)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatTime(selectedSession.start_time)} -{" "}
                    {formatTime(
                      `${Math.floor(
                        (parseInt(selectedSession.start_time.split(":")[0]) * 60 +
                          parseInt(selectedSession.start_time.split(":")[1]) +
                          selectedSession.duration_minutes) /
                          60
                      )
                        .toString()
                        .padStart(2, "0")}:${(
                        (parseInt(selectedSession.start_time.split(":")[0]) * 60 +
                          parseInt(selectedSession.start_time.split(":")[1]) +
                          selectedSession.duration_minutes) %
                        60
                      )
                        .toString()
                        .padStart(2, "0")}`
                    )}{" "}
                    ({selectedSession.duration_minutes} min)
                  </p>
                </div>
              </div>

              {/* Location */}
              {selectedSession.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Location
                    </p>
                    <p className="text-base text-gray-900 dark:text-white">
                      {selectedSession.location}
                    </p>
                  </div>
                </div>
              )}

              {/* Recurring Info */}
              {selectedSession.recurrence_id && (
                <div className="flex items-start gap-3">
                  <Repeat className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Recurring Session
                    </p>
                    <p className="text-base text-gray-900 dark:text-white">
                      {selectedSession.is_override
                        ? "Part of recurring pattern (edited)"
                        : "Part of recurring pattern"}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedSession.notes && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                    Notes
                  </p>
                  <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                    {selectedSession.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => handleMarkAttendance(selectedSession)}
                  className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  <UserCheck className="h-4 w-4" />
                  Mark Attendance
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEditSession(selectedSession);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleDeleteClick(selectedSession);
                    }}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {showAttendanceModal && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Mark Attendance
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {selectedSession.teams.name} -{" "}
                  {formatDate(selectedSession.session_date)} at{" "}
                  {formatTime(selectedSession.start_time)}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAttendanceModal(false);
                  setAttendanceData([]);
                }}
                disabled={isSavingAttendance}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {attendanceData.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No players in this team
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                          #
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Player
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Arrival Time
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300">
                          Notes
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {attendanceData.map((record) => (
                        <tr key={record.player_id}>
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                            {record.jersey_number || "-"}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {record.first_name} {record.last_name}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              value={record.status || ""}
                              onChange={(e) =>
                                handleAttendanceChange(
                                  record.player_id,
                                  "status",
                                  e.target.value
                                )
                              }
                              className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            >
                              <option value="">Not marked</option>
                              <option value="present">Present</option>
                              <option value="absent">Absent</option>
                              <option value="late">Late</option>
                              <option value="excused">Excused</option>
                              <option value="injured">Injured</option>
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="time"
                              value={record.arrival_time || ""}
                              onChange={(e) =>
                                handleAttendanceChange(
                                  record.player_id,
                                  "arrival_time",
                                  e.target.value
                                )
                              }
                              disabled={record.status !== "late"}
                              className="rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={record.notes || ""}
                              onChange={(e) =>
                                handleAttendanceChange(
                                  record.player_id,
                                  "notes",
                                  e.target.value
                                )
                              }
                              placeholder="Optional notes"
                              className="w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 border-t border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAttendanceModal(false);
                    setAttendanceData([]);
                  }}
                  disabled={isSavingAttendance}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAttendance}
                  disabled={isSavingAttendance}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  {isSavingAttendance ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && sessionToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Training Session
            </h3>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this training session?
            </p>
            <div className="mt-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {sessionToDelete.teams.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {formatDate(sessionToDelete.session_date)} at{" "}
                {formatTime(sessionToDelete.start_time)}
              </p>
            </div>

            {/* Radio buttons for recurring sessions */}
            {sessionToDelete.recurrence_id && (
              <div className="mt-4 space-y-2">
                <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="delete_mode"
                    value="single"
                    checked={deleteMode === "single"}
                    onChange={() => setDeleteMode("single")}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Delete only this session
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(sessionToDelete.session_date)}
                    </p>
                  </div>
                </label>
                <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700">
                  <input
                    type="radio"
                    name="delete_mode"
                    value="all_future"
                    checked={deleteMode === "all_future"}
                    onChange={() => setDeleteMode("all_future")}
                    className="mt-0.5"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Delete all future sessions in this pattern
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This will remove the recurring pattern and all future sessions
                    </p>
                  </div>
                </label>
              </div>
            )}

            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              This action cannot be undone.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSessionToDelete(null);
                }}
                disabled={isDeleting}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 dark:bg-red-500 dark:hover:bg-red-600"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 shadow-lg dark:border-green-800 dark:bg-green-900/30">
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              {successMessage}
            </p>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="ml-2 rounded p-1 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
