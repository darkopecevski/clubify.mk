"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  Loader2,
  Edit2,
  Ban,
  Save,
  X,
  CheckCircle,
  UserCheck,
  UserX,
  Clock3,
  Shield,
  Heart,
  Repeat,
  Target,
} from "lucide-react";

type TrainingSession = {
  id: string;
  team_id: string;
  recurrence_id: string | null;
  session_date: string;
  start_time: string;
  duration_minutes: number;
  location: string | null;
  focus_areas: string[] | null;
  notes: string | null;
  is_cancelled: boolean;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  teams: {
    id: string;
    name: string;
    age_group: string | null;
    season: string | null;
    club_id: string;
    clubs: {
      id: string;
      name: string;
    } | null;
  };
  recurrence_pattern: {
    day_of_week: number;
    is_active: boolean;
  } | null;
};

type AttendanceRecord = {
  player_id: string;
  first_name: string;
  last_name: string;
  jersey_number: number | null;
  status: string | null;
  arrival_time: string | null;
  notes: string | null;
};

export default function TrainingDetailsClient() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.clubId as string;
  const sessionId = params.sessionId as string;

  const [session, setSession] = useState<TrainingSession | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetchSession();
    fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/coach/training/${sessionId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch training session");
      }
      const data = await response.json();
      setSession(data.session);
      setNotesValue(data.session.notes || "");
    } catch (error) {
      console.error("Error fetching session:", error);
      setErrorMessage("Failed to load training session");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      setAttendanceLoading(true);
      const response = await fetch(`/api/coach/training/${sessionId}/attendance`);
      if (response.ok) {
        const data = await response.json();
        setAttendance(data.attendance || []);
      }
    } catch (err) {
      console.error("Error fetching attendance:", err);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const handleAttendanceChange = (
    playerId: string,
    field: "status" | "arrival_time" | "notes",
    value: string
  ) => {
    setAttendance((prev) =>
      prev.map((record) =>
        record.player_id === playerId ? { ...record, [field]: value } : record
      )
    );
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/coach/training/${sessionId}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          attendance: attendance.map((record) => ({
            player_id: record.player_id,
            status: record.status,
            arrival_time: record.arrival_time,
            notes: record.notes,
          })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save attendance");
      }

      setSuccessMessage("Attendance saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save attendance");
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    setErrorMessage("");
    try {
      const response = await fetch(`/api/coach/training/${sessionId}/notes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesValue }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save notes");
      }

      setEditingNotes(false);
      setSuccessMessage("Notes saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      fetchSession();
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save notes");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleCancelSession = async () => {
    setCancelLoading(true);
    try {
      const response = await fetch(`/api/coach/training/${sessionId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delete_mode: "single" }),
      });

      if (!response.ok) {
        throw new Error("Failed to cancel session");
      }

      router.push(`/club/${clubId}/training`);
    } catch (error) {
      console.error("Error cancelling session:", error);
      setErrorMessage("Failed to cancel session. Please try again.");
    } finally {
      setCancelLoading(false);
      setShowCancelConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-200px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-800 dark:text-red-200">Training session not found</p>
        <button
          onClick={() => router.push(`/club/${clubId}/training`)}
          className="mt-4 text-sm text-red-600 hover:underline dark:text-red-400"
        >
          Return to training sessions
        </button>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(":").map(Number);
    const totalMinutes = hours * 60 + minutes + durationMinutes;
    const endHours = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const timeStr = `${endHours.toString().padStart(2, "0")}:${endMinutes.toString().padStart(2, "0")}:00`;
    return formatTime(timeStr);
  };

  const getStatusBadge = () => {
    if (session.is_cancelled) {
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800 dark:bg-red-900/20 dark:text-red-400">
          Cancelled
        </span>
      );
    }

    const sessionDate = new Date(session.session_date + "T" + session.start_time);
    const now = new Date();

    if (sessionDate > now) {
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          Scheduled
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
          Completed
        </span>
      );
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return days[dayOfWeek];
  };

  const getAttendanceSummary = () => {
    const present = attendance.filter((a) => a.status === "present").length;
    const absent = attendance.filter((a) => a.status === "absent").length;
    const late = attendance.filter((a) => a.status === "late").length;
    const excused = attendance.filter((a) => a.status === "excused").length;
    const injured = attendance.filter((a) => a.status === "injured").length;
    const total = attendance.length;

    return { present, absent, late, excused, injured, total };
  };

  const summary = getAttendanceSummary();

  const getStatusColor = (status: string | null) => {
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

  return (
    <>
      <div className="space-y-6">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                {successMessage}
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-center gap-2">
              <X className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/club/${clubId}/training`)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Training Session Details
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatDate(session.session_date)} at {formatTime(session.start_time)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge()}
            {/* Show Edit/Delete buttons only for upcoming sessions */}
            {!session.is_cancelled && new Date(session.session_date + "T" + session.start_time) > new Date() && (
              <>
                <button
                  onClick={() => {
                    // Store the session ID in sessionStorage and navigate back
                    sessionStorage.setItem('editSessionId', sessionId);
                    router.push(`/club/${clubId}/training`);
                  }}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Session
                </button>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  <Ban className="h-4 w-4" />
                  Delete
                </button>
              </>
            )}
          </div>
        </div>

        {/* Session Info Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
            <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">
              {session.teams.name}
              {session.teams.age_group && (
                <span className="ml-2 text-lg text-gray-500 dark:text-gray-400">
                  ({session.teams.age_group})
                </span>
              )}
            </h2>
            {session.teams.clubs && (
              <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                {session.teams.clubs.name}
              </p>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Date
                </div>
                <div className="text-base text-gray-900 dark:text-white">
                  {formatDate(session.session_date)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Time
                </div>
                <div className="text-base text-gray-900 dark:text-white">
                  {formatTime(session.start_time)} -{" "}
                  {calculateEndTime(session.start_time, session.duration_minutes)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Duration
                </div>
                <div className="text-base text-gray-900 dark:text-white">
                  {session.duration_minutes} minutes
                </div>
              </div>
            </div>

            {session.location && (
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Location
                  </div>
                  <div className="text-base text-gray-900 dark:text-white">
                    {session.location}
                  </div>
                </div>
              </div>
            )}

            {session.recurrence_pattern && (
              <div className="flex items-start gap-3">
                <Repeat className="mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Recurring Session
                  </div>
                  <div className="text-base text-gray-900 dark:text-white">
                    Every {getDayName(session.recurrence_pattern.day_of_week)}
                  </div>
                </div>
              </div>
            )}

            {session.focus_areas && session.focus_areas.length > 0 && (
              <div className="flex items-start gap-3">
                <Target className="mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Focus Areas
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {session.focus_areas.map((area, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Attendance Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Attendance
            </h2>
            <button
              onClick={handleSaveAttendance}
              disabled={savingAttendance}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
            >
              <Save className="h-4 w-4" />
              {savingAttendance ? "Saving..." : "Save Attendance"}
            </button>
          </div>

          {/* Attendance Summary */}
          {summary.total > 0 && (
            <div className="mb-6 grid grid-cols-2 gap-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50 sm:grid-cols-3 lg:grid-cols-6">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
                </div>
                <div className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
                  {summary.total}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <UserCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Present</span>
                </div>
                <div className="mt-1 text-xl font-bold text-green-600 dark:text-green-400">
                  {summary.present}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <UserX className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Absent</span>
                </div>
                <div className="mt-1 text-xl font-bold text-red-600 dark:text-red-400">
                  {summary.absent}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Late</span>
                </div>
                <div className="mt-1 text-xl font-bold text-yellow-600 dark:text-yellow-400">
                  {summary.late}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Excused</span>
                </div>
                <div className="mt-1 text-xl font-bold text-blue-600 dark:text-blue-400">
                  {summary.excused}
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                  <Heart className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Injured</span>
                </div>
                <div className="mt-1 text-xl font-bold text-purple-600 dark:text-purple-400">
                  {summary.injured}
                </div>
              </div>
            </div>
          )}

          {attendanceLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-green-600" />
            </div>
          ) : attendance.length > 0 ? (
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
                  {attendance.map((record) => (
                    <tr key={record.player_id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
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
                          className={`rounded-lg border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 ${getStatusColor(record.status)}`}
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
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                No players in this team
              </p>
            </div>
          )}
        </div>

        {/* Training Notes Section */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Training Notes / Recap
            </h2>
            {!editingNotes && (
              <button
                onClick={() => setEditingNotes(true)}
                className="flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                <Edit2 className="h-4 w-4" />
                Edit Notes
              </button>
            )}
          </div>

          {editingNotes ? (
            <div className="space-y-4">
              <textarea
                value={notesValue}
                onChange={(e) => setNotesValue(e.target.value)}
                rows={8}
                placeholder="Add training notes, drills performed, observations, player performance, areas for improvement..."
                className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
              />
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => {
                    setEditingNotes(false);
                    setNotesValue(session.notes || "");
                  }}
                  disabled={savingNotes}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNotes}
                  disabled={savingNotes}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  <Save className="h-4 w-4" />
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
              </div>
            </div>
          ) : session.notes ? (
            <div className="whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900/50 dark:text-white">
              {session.notes}
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center dark:border-gray-700 dark:bg-gray-900/50">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No training notes added yet. Click &quot;Edit Notes&quot; to add observations
                and recap of the session.
              </p>
            </div>
          )}

          {session.updated_at && !editingNotes && session.notes && (
            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Last updated: {new Date(session.updated_at).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          )}
        </div>

        {/* Actions */}
        {!session.is_cancelled && (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {!showCancelConfirm ? (
              <>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Ban className="h-4 w-4" />
                  Cancel Session
                </button>
                <button
                  onClick={() => router.push(`/club/${clubId}/training`)}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  Back to Training Sessions
                </button>
              </>
            ) : (
              <div className="flex w-full items-center justify-between rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Are you sure you want to cancel this training session?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowCancelConfirm(false)}
                    disabled={cancelLoading}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
                  >
                    No
                  </button>
                  <button
                    onClick={handleCancelSession}
                    disabled={cancelLoading}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
