"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DayView from "./DayView";
import WeekView from "./WeekView";
import MonthView from "./MonthView";

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

type TrainingCalendarProps = {
  sessions: TrainingSession[];
  onSessionClick: (session: TrainingSession) => void;
  onCreateSession: (date: string, time?: string) => void;
};

type ViewMode = "day" | "week" | "month";

export default function TrainingCalendar({
  sessions,
  onSessionClick,
  onCreateSession,
}: TrainingCalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });
  const [viewMode, setViewMode] = useState<ViewMode>("week");

  // Navigation handlers
  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    newDate.setHours(0, 0, 0, 0);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    newDate.setHours(0, 0, 0, 0);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setCurrentDate(today);
  };

  // Format date range display
  const getDateRangeDisplay = () => {
    if (viewMode === "day") {
      return currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } else if (viewMode === "week") {
      const weekStart = new Date(currentDate);
      const dayOfWeek = weekStart.getDay();
      weekStart.setDate(weekStart.getDate() - dayOfWeek);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const startMonth = weekStart.toLocaleDateString("en-US", { month: "short" });
      const endMonth = weekEnd.toLocaleDateString("en-US", { month: "short" });
      const year = weekStart.getFullYear();

      if (startMonth === endMonth) {
        return `${startMonth} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${year}`;
      } else {
        return `${startMonth} ${weekStart.getDate()} - ${endMonth} ${weekEnd.getDate()}, ${year}`;
      }
    } else {
      return currentDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
    }
  };

  // Time slot click handler
  const handleTimeSlotClick = (date: string, time?: string) => {
    onCreateSession(date, time);
  };

  // Date click handler (for month view)
  const handleDateClick = (date: string) => {
    onCreateSession(date);
  };

  return (
    <div className="space-y-4">
      {/* Header with navigation and view toggles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={handleToday}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Today
          </button>
          <button
            onClick={handleNext}
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Date range display */}
          <div className="ml-2 text-xl font-semibold text-gray-900 dark:text-white">
            {getDateRangeDisplay()}
          </div>
        </div>

        {/* View mode toggles */}
        <div className="flex rounded-lg border border-gray-300 dark:border-gray-600">
          <button
            onClick={() => setViewMode("day")}
            className={`rounded-l-lg px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "day"
                ? "bg-green-600 text-white dark:bg-green-500"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={`border-x border-gray-300 px-4 py-2 text-sm font-medium transition-colors dark:border-gray-600 ${
              viewMode === "week"
                ? "bg-green-600 text-white dark:bg-green-500"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={`rounded-r-lg px-4 py-2 text-sm font-medium transition-colors ${
              viewMode === "month"
                ? "bg-green-600 text-white dark:bg-green-500"
                : "bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Month
          </button>
        </div>
      </div>

      {/* Calendar view */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {viewMode === "day" && (
          <DayView
            sessions={sessions}
            currentDate={currentDate}
            onSessionClick={onSessionClick}
            onTimeSlotClick={(time) => handleTimeSlotClick(currentDate.toISOString().split("T")[0], time)}
          />
        )}

        {viewMode === "week" && (
          <WeekView
            sessions={sessions}
            currentDate={currentDate}
            onSessionClick={onSessionClick}
            onTimeSlotClick={handleTimeSlotClick}
          />
        )}

        {viewMode === "month" && (
          <MonthView
            sessions={sessions}
            currentDate={currentDate}
            onSessionClick={onSessionClick}
            onDateClick={handleDateClick}
          />
        )}
      </div>
    </div>
  );
}
