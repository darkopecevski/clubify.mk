"use client";

import { RefreshCw } from "lucide-react";

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

type MonthViewProps = {
  sessions: TrainingSession[];
  currentDate: Date;
  onSessionClick: (session: TrainingSession) => void;
  onDateClick: (date: string) => void;
};

// Team color palette (consistent across calendar)
const TEAM_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-orange-500",
  "bg-pink-500",
  "bg-yellow-500",
  "bg-indigo-500",
  "bg-teal-500",
];

export default function MonthView({
  sessions,
  currentDate,
  onSessionClick,
  onDateClick,
}: MonthViewProps) {
  // Get all days in the month grid (including prev/next month days)
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    firstDay.setHours(0, 0, 0, 0);
    const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

    // Last day of month
    const lastDay = new Date(year, month + 1, 0);
    lastDay.setHours(0, 0, 0, 0);
    const endDate = lastDay.getDate();

    // Days array
    const days: Date[] = [];

    // Add previous month's trailing days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(firstDay);
      day.setDate(day.getDate() - (i + 1));
      day.setHours(0, 0, 0, 0);
      days.push(day);
    }

    // Add current month's days
    for (let i = 1; i <= endDate; i++) {
      const day = new Date(year, month, i);
      day.setHours(0, 0, 0, 0);
      days.push(day);
    }

    // Add next month's leading days to complete the grid
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        const day = new Date(year, month + 1, i);
        day.setHours(0, 0, 0, 0);
        days.push(day);
      }
    }

    return days;
  };

  const monthDays = getMonthDays(currentDate);

  // Format date as YYYY-MM-DD (avoiding timezone issues)
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
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

  return (
    <div>
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            className="p-2 text-center text-xs font-semibold text-gray-700 dark:text-gray-300"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7">
        {monthDays.map((date, index) => {
          const daySessions = getSessionsForDate(date);
          const today = isToday(date);
          const currentMonth = isCurrentMonth(date);

          return (
            <div
              key={index}
              className={`min-h-[120px] border-b border-r border-gray-200 p-2 dark:border-gray-700 ${
                !currentMonth ? "bg-gray-50 dark:bg-gray-900/30" : ""
              } ${today ? "bg-green-50 dark:bg-green-900/10" : ""} hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors cursor-pointer`}
              onClick={() => onDateClick(formatDate(date))}
            >
              {/* Date number */}
              <div
                className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-sm font-semibold ${
                  today
                    ? "bg-green-600 text-white dark:bg-green-500"
                    : currentMonth
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-gray-600"
                }`}
              >
                {date.getDate()}
              </div>

              {/* Sessions for this day */}
              <div className="space-y-1">
                {daySessions.slice(0, 3).map((session) => {
                  const color = getTeamColor(session.teams.id);

                  return (
                    <div
                      key={session.id}
                      className={`rounded px-1.5 py-0.5 text-xs text-white cursor-pointer hover:opacity-80 transition-opacity ${color} ${
                        session.recurrence_id ? "ring-1 ring-white/30 ring-inset" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSessionClick(session);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="font-medium truncate">
                          {formatTime(session.start_time)}
                        </span>
                        <span className="truncate">{session.teams.name}</span>
                        {session.recurrence_id && (
                          <RefreshCw className={`h-3 w-3 flex-shrink-0 ${session.is_override ? "opacity-40" : ""}`} />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Show "+N more" if there are more than 3 sessions */}
                {daySessions.length > 3 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 px-1.5">
                    +{daySessions.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
