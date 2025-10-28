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

type DayViewProps = {
  sessions: TrainingSession[];
  currentDate: Date;
  onSessionClick: (session: TrainingSession) => void;
  onTimeSlotClick: (time: string) => void;
};

// Team color palette (consistent across calendar)
const TEAM_COLORS = [
  "bg-blue-100 border-blue-400 text-blue-900 dark:bg-blue-900/30 dark:border-blue-600 dark:text-blue-100",
  "bg-green-100 border-green-400 text-green-900 dark:bg-green-900/30 dark:border-green-600 dark:text-green-100",
  "bg-purple-100 border-purple-400 text-purple-900 dark:bg-purple-900/30 dark:border-purple-600 dark:text-purple-100",
  "bg-orange-100 border-orange-400 text-orange-900 dark:bg-orange-900/30 dark:border-orange-600 dark:text-orange-100",
  "bg-pink-100 border-pink-400 text-pink-900 dark:bg-pink-900/30 dark:border-pink-600 dark:text-pink-100",
  "bg-yellow-100 border-yellow-400 text-yellow-900 dark:bg-yellow-900/30 dark:border-yellow-600 dark:text-yellow-100",
  "bg-indigo-100 border-indigo-400 text-indigo-900 dark:bg-indigo-900/30 dark:border-indigo-600 dark:text-indigo-100",
  "bg-teal-100 border-teal-400 text-teal-900 dark:bg-teal-900/30 dark:border-teal-600 dark:text-teal-100",
];

export default function DayView({
  sessions,
  currentDate,
  onSessionClick,
  onTimeSlotClick,
}: DayViewProps) {
  const hours = Array.from({ length: 15 }, (_, i) => i + 7); // 7 AM to 9 PM

  // Format date as YYYY-MM-DD (avoiding timezone issues)
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get sessions for the current date
  const dateStr = formatDate(currentDate);
  const daySessions = sessions.filter((s) => s.session_date === dateStr);

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
    const top = ((startMinutes - startHour) / 60) * 6; // 6rem per hour
    const height = (session.duration_minutes / 60) * 6; // 6rem per hour

    return {
      top: `${top}rem`,
      height: `${height}rem`,
    };
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative">
        {/* Time slots */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="flex border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
            style={{ height: "6rem" }}
            onClick={() => onTimeSlotClick(`${hour.toString().padStart(2, "0")}:00`)}
          >
            {/* Time label */}
            <div className="w-20 flex-shrink-0 p-3 text-sm font-medium text-gray-600 dark:text-gray-400">
              {hour}:00
            </div>

            {/* Content area */}
            <div className="flex-1 border-l border-gray-200 dark:border-gray-700" />
          </div>
        ))}

        {/* Session blocks (absolutely positioned) */}
        <div className="absolute top-0 left-20 right-0">
          {daySessions.map((session) => {
            const style = getSessionStyle(session);
            const color = getTeamColor(session.teams.id);

            return (
              <div
                key={session.id}
                className={`absolute left-2 right-2 overflow-hidden rounded-lg border-l-4 p-3 shadow-md cursor-pointer hover:shadow-lg transition-shadow ${color} ${
                  session.recurrence_id ? "ring-2 ring-gray-400/40 ring-inset dark:ring-gray-300/30" : ""
                }`}
                style={style}
                onClick={(e) => {
                  e.stopPropagation();
                  onSessionClick(session);
                }}
              >
                <div className="font-bold text-base mb-2">
                  {session.teams.name}
                  {session.teams.age_group && (
                    <span className="ml-2 text-sm font-normal opacity-75">
                      {session.teams.age_group}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-sm mb-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {formatTime(session.start_time)} -{" "}
                    {formatTime(
                      `${Math.floor(
                        (parseInt(session.start_time.split(":")[0]) * 60 +
                          parseInt(session.start_time.split(":")[1]) +
                          session.duration_minutes) /
                          60
                      )
                        .toString()
                        .padStart(2, "0")}:${(
                        (parseInt(session.start_time.split(":")[0]) * 60 +
                          parseInt(session.start_time.split(":")[1]) +
                          session.duration_minutes) %
                        60
                      )
                        .toString()
                        .padStart(2, "0")}`
                    )}
                  </span>
                  <span className="opacity-75">
                    ({session.duration_minutes} min)
                  </span>
                </div>

                {session.location && (
                  <div className="flex items-center gap-2 text-sm mb-1">
                    <MapPin className="h-4 w-4" />
                    <span>{session.location}</span>
                  </div>
                )}

                {session.recurrence_id && (
                  <div className="flex items-center gap-2 text-sm opacity-75 mt-2">
                    <RefreshCw className={`h-4 w-4 ${session.is_override ? "opacity-40" : ""}`} />
                    <span className="text-xs">
                      {session.is_override ? "Recurring (edited)" : "Recurring session"}
                    </span>
                  </div>
                )}

                {session.notes && (
                  <div className="mt-2 text-sm opacity-90 line-clamp-2">
                    {session.notes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
