"use client";

import { Clock, MapPin, RefreshCw } from "lucide-react";

type TrainingSession = {
  id: string;
  session_date: string;
  start_time: string;
  duration_minutes: number;
  location: string | null;
  notes: string | null;
  recurrence_id: string | null;
  is_override: boolean;
  teams: {
    id: string;
    name: string;
    age_group: string | null;
  };
};

type WeekViewProps = {
  sessions: TrainingSession[];
  currentDate: Date;
  onSessionClick: (session: TrainingSession) => void;
  onTimeSlotClick: (date: string, time: string) => void;
};

// Team color palette (consistent across calendar)
const TEAM_COLORS = [
  "bg-blue-100 border-blue-400 dark:bg-blue-900/30 dark:border-blue-600",
  "bg-green-100 border-green-400 dark:bg-green-900/30 dark:border-green-600",
  "bg-purple-100 border-purple-400 dark:bg-purple-900/30 dark:border-purple-600",
  "bg-orange-100 border-orange-400 dark:bg-orange-900/30 dark:border-orange-600",
  "bg-pink-100 border-pink-400 dark:bg-pink-900/30 dark:border-pink-600",
  "bg-yellow-100 border-yellow-400 dark:bg-yellow-900/30 dark:border-yellow-600",
  "bg-indigo-100 border-indigo-400 dark:bg-indigo-900/30 dark:border-indigo-600",
  "bg-teal-100 border-teal-400 dark:bg-teal-900/30 dark:border-teal-600",
];

export default function WeekView({
  sessions,
  currentDate,
  onSessionClick,
  onTimeSlotClick,
}: WeekViewProps) {
  // Get week start (Sunday) and end (Saturday)
  const getWeekDays = (date: Date) => {
    const days: Date[] = [];
    const current = new Date(date);
    const dayOfWeek = current.getDay();
    const diff = current.getDate() - dayOfWeek; // Sunday = 0

    for (let i = 0; i < 7; i++) {
      const day = new Date(current);
      day.setDate(diff + i);
      // Reset time to avoid timezone issues
      day.setHours(0, 0, 0, 0);
      days.push(day);
    }

    return days;
  };

  const weekDays = getWeekDays(currentDate);
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

  // Format date as YYYY-MM-DD (avoiding timezone issues)
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format day header
  const formatDayHeader = (date: Date) => {
    const day = date.toLocaleDateString("en-US", { weekday: "short" });
    const dayNum = date.getDate();
    return { day, dayNum };
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    const dateStr = formatDate(date);
    return sessions.filter((s) => s.session_date === dateStr);
  };

  // Get team color based on team ID
  const getTeamColor = (teamId: string) => {
    const uniqueTeamIds = [...new Set(sessions.map((s) => s.teams.id))];
    const index = uniqueTeamIds.indexOf(teamId);
    return TEAM_COLORS[index % TEAM_COLORS.length];
  };

  // Format time HH:MM
  const formatTime = (timeStr: string) => {
    return timeStr.substring(0, 5);
  };

  // Calculate position and height for session block
  const getSessionStyle = (session: TrainingSession) => {
    const [hours, minutes] = session.start_time.split(":").map(Number);
    const startMinutes = hours * 60 + minutes;
    const startHour = 7 * 60; // 7 AM

    // Calculate top position (relative to 7 AM)
    const top = ((startMinutes - startHour) / 60) * 4; // 4rem per hour
    const height = (session.duration_minutes / 60) * 4; // 4rem per hour

    return {
      top: `${top}rem`,
      height: `${height}rem`,
    };
  };

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with days */}
        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
          {/* Time column header */}
          <div className="p-2 text-xs font-medium text-gray-500 dark:text-gray-400">
            Time
          </div>

          {/* Day headers */}
          {weekDays.map((date, index) => {
            const { day, dayNum } = formatDayHeader(date);
            const today = isToday(date);

            return (
              <div
                key={index}
                className={`border-l border-gray-200 p-2 text-center dark:border-gray-700 ${
                  today ? "bg-green-50 dark:bg-green-900/10" : ""
                }`}
              >
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {day}
                </div>
                <div
                  className={`mt-1 flex h-8 w-8 mx-auto items-center justify-center rounded-full text-sm font-semibold ${
                    today
                      ? "bg-green-600 text-white dark:bg-green-500"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {dayNum}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="relative">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8" style={{ height: "4rem" }}>
              {/* Time label */}
              <div className="border-b border-r border-gray-200 p-2 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                {hour}:00
              </div>

              {/* Day columns */}
              {weekDays.map((date, dayIndex) => {
                const dateStr = formatDate(date);
                const timeStr = `${hour.toString().padStart(2, "0")}:00`;

                return (
                  <div
                    key={dayIndex}
                    className="border-b border-l border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => onTimeSlotClick(dateStr, timeStr)}
                  />
                );
              })}
            </div>
          ))}

          {/* Session blocks (absolutely positioned) */}
          {weekDays.map((date, dayIndex) => {
            const daySessions = getSessionsForDate(date);

            return (
              <div key={dayIndex} className="absolute top-0" style={{ left: `${(dayIndex + 1) * 12.5}%`, width: "12.5%" }}>
                {daySessions.map((session) => {
                  const style = getSessionStyle(session);
                  const color = getTeamColor(session.teams.id);

                  return (
                    <div
                      key={session.id}
                      className={`absolute mx-0.5 overflow-hidden rounded border-l-4 p-1.5 text-xs shadow-sm cursor-pointer hover:shadow-md transition-shadow ${color} ${
                        session.recurrence_id ? "ring-1 ring-gray-400/40 ring-inset dark:ring-gray-300/30" : ""
                      }`}
                      style={style}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSessionClick(session);
                      }}
                    >
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {session.teams.name}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-gray-700 dark:text-gray-300">
                        <Clock className="h-3 w-3" />
                        <span className="truncate">
                          {formatTime(session.start_time)}
                        </span>
                      </div>
                      {session.location && (
                        <div className="mt-0.5 flex items-center gap-1 text-gray-700 dark:text-gray-300">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{session.location}</span>
                        </div>
                      )}
                      {session.recurrence_id && (
                        <div className="mt-0.5 flex items-center gap-1 text-gray-600 dark:text-gray-400">
                          <RefreshCw className={`h-3 w-3 ${session.is_override ? "opacity-40" : ""}`} />
                          <span className="text-xs">Recurring</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
