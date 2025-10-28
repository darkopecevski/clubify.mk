"use client";

import { useState } from "react";
import { X, Calendar, Clock, MapPin, Trophy, FileText, Edit2, Ban } from "lucide-react";

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

type MatchDetailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onCancel: () => void;
  match: Match | null;
};

export default function MatchDetailModal({
  isOpen,
  onClose,
  onEdit,
  onCancel,
  match,
}: MatchDetailModalProps) {
  const [cancelLoading, setCancelLoading] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  if (!isOpen || !match) return null;

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
        className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
          statusStyles[status as keyof typeof statusStyles] || statusStyles.scheduled
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleCancelMatch = async () => {
    setCancelLoading(true);
    try {
      const response = await fetch(`/api/matches/${match.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel match");
      }

      onCancel();
      onClose();
    } catch (error) {
      console.error("Error cancelling match:", error);
      alert("Failed to cancel match. Please try again.");
    } finally {
      setCancelLoading(false);
      setShowCancelConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Match Details
            </h2>
            {getStatusBadge(match.status)}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Match Info */}
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
            <div className="text-center">
              {match.teams.clubs?.name && (
                <div className="mb-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {match.teams.clubs.name}
                </div>
              )}
              <div className="flex items-center justify-center gap-6">
                <div className="flex-1 text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {match.teams.name}
                  </div>
                  {match.teams.name !== match.teams.age_group && (
                    <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {match.teams.age_group}
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold text-gray-400">vs</div>
                </div>
                <div className="flex-1 text-left">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {match.away_team_name}
                  </div>
                </div>
              </div>
              {match.home_score !== null && match.away_score !== null && (
                <div className="mt-4 text-4xl font-bold text-green-600 dark:text-green-400">
                  {match.home_score} - {match.away_score}
                </div>
              )}
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Date
                </div>
                <div className="text-base text-gray-900 dark:text-white">
                  {formatDate(match.match_date)}
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
                  {formatTime(match.start_time)}
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Location
                </div>
                <div className="text-base text-gray-900 dark:text-white">
                  {match.location}
                </div>
              </div>
            </div>

            {match.competition && (
              <div className="flex items-start gap-3">
                <Trophy className="mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Competition
                  </div>
                  <div className="text-base text-gray-900 dark:text-white">
                    {match.competition}
                  </div>
                </div>
              </div>
            )}

            {match.notes && (
              <div className="flex items-start gap-3">
                <FileText className="mt-0.5 h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Notes
                  </div>
                  <div className="text-base text-gray-900 dark:text-white">
                    {match.notes}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-gray-200 p-6 dark:border-gray-700">
          {match.status === "scheduled" && !showCancelConfirm ? (
            <>
              <button
                onClick={() => setShowCancelConfirm(true)}
                className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <Ban className="h-4 w-4" />
                Cancel Match
              </button>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                >
                  Close
                </button>
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Match
                </button>
              </div>
            </>
          ) : showCancelConfirm ? (
            <div className="flex w-full items-center justify-between rounded-lg border border-red-300 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-200">
                Are you sure you want to cancel this match?
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
                  onClick={handleCancelMatch}
                  disabled={cancelLoading}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {cancelLoading ? "Cancelling..." : "Yes, Cancel"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onClose}
              className="ml-auto rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
