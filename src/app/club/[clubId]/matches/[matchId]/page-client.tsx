"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  FileText,
  Edit2,
  Ban,
  Users,
  ChevronLeft,
  Loader2,
} from "lucide-react";
import EditMatchModal from "@/components/matches/EditMatchModal";
import SquadSelectionModal from "@/components/matches/SquadSelectionModal";

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

type SquadMember = {
  id: string;
  is_starting: boolean;
  jersey_number: number | null;
  position: string | null;
  notes: string | null;
  players: {
    first_name: string;
    last_name: string;
  };
};

export default function MatchDetailsClient() {
  const params = useParams();
  const router = useRouter();
  const clubId = params.clubId as string;
  const matchId = params.matchId as string;

  const [match, setMatch] = useState<Match | null>(null);
  const [squad, setSquad] = useState<SquadMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [squadLoading, setSquadLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSquadModal, setShowSquadModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchMatch();
    fetchSquad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId]);

  const fetchMatch = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/matches/${matchId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch match");
      }
      const data = await response.json();
      setMatch(data.match);
    } catch (error) {
      console.error("Error fetching match:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSquad = async () => {
    try {
      setSquadLoading(true);
      const response = await fetch(`/api/matches/${matchId}/squad`);
      if (response.ok) {
        const data = await response.json();
        setSquad(data.squad || []);
      }
    } catch (err) {
      console.error("Error fetching squad:", err);
    } finally {
      setSquadLoading(false);
    }
  };

  const handleCancelMatch = async () => {
    setCancelLoading(true);
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to cancel match");
      }

      router.push(`/club/${clubId}/matches`);
    } catch (error) {
      console.error("Error cancelling match:", error);
      alert("Failed to cancel match. Please try again.");
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

  if (!match) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-800 dark:text-red-200">Match not found</p>
        <button
          onClick={() => router.push(`/club/${clubId}/matches`)}
          className="mt-4 text-sm text-red-600 hover:underline dark:text-red-400"
        >
          Return to matches
        </button>
      </div>
    );
  }

  const startingCount = squad.filter((s) => s.is_starting).length;
  const totalSquad = squad.length;

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

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/club/${clubId}/matches`)}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Match Details
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {formatDate(match.match_date)} at {formatTime(match.start_time)}
              </p>
            </div>
          </div>
          {getStatusBadge(match.status)}
        </div>

        {/* Match Info Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
            <div className="text-center">
              <div className="flex items-center justify-center gap-6">
                <div className="flex-1 text-right">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {match.teams.clubs?.name} ({match.teams.name})
                  </div>
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

          {/* Match Details */}
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

        {/* Squad Section */}
        {match.status === "scheduled" && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Squad Selection
              </h2>
              <button
                onClick={() => setShowSquadModal(true)}
                className="flex items-center gap-2 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                <Users className="h-4 w-4" />
                {totalSquad > 0 ? "Edit Squad" : "Select Squad"}
              </button>
            </div>

            {squadLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-green-600" />
              </div>
            ) : totalSquad > 0 ? (
              <div className="space-y-4">
                {/* Stats */}
                <div className="flex items-center gap-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900/50">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Total:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {totalSquad}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Starting 11:
                    </span>
                    <span
                      className={`font-semibold ${
                        startingCount === 11
                          ? "text-green-600 dark:text-green-400"
                          : "text-orange-600 dark:text-orange-400"
                      }`}
                    >
                      {startingCount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Subs:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {totalSquad - startingCount}
                    </span>
                  </div>
                </div>

                {/* Starting 11 */}
                {startingCount > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium uppercase text-gray-500 dark:text-gray-400">
                      Starting 11
                    </h3>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {squad
                        .filter((s) => s.is_starting)
                        .map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20"
                          >
                            {s.jersey_number && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                                {s.jersey_number}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {s.players.first_name} {s.players.last_name}
                              </div>
                              {s.position && (
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {s.position}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Substitutes */}
                {totalSquad - startingCount > 0 && (
                  <div>
                    <h3 className="mb-2 text-sm font-medium uppercase text-gray-500 dark:text-gray-400">
                      Substitutes
                    </h3>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {squad
                        .filter((s) => !s.is_starting)
                        .map((s) => (
                          <div
                            key={s.id}
                            className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800"
                          >
                            {s.jersey_number && (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-400 text-sm font-bold text-white dark:bg-gray-600">
                                {s.jersey_number}
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {s.players.first_name} {s.players.last_name}
                              </div>
                              {s.position && (
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {s.position}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-6 text-center dark:border-orange-800 dark:bg-orange-900/20">
                <Users className="mx-auto h-12 w-12 text-orange-400" />
                <p className="mt-2 text-sm font-medium text-orange-800 dark:text-orange-200">
                  No squad selected yet
                </p>
                <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
                  Click &quot;Select Squad&quot; to choose players for this match
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {match.status === "scheduled" && (
          <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            {!showCancelConfirm ? (
              <>
                <button
                  onClick={() => setShowCancelConfirm(true)}
                  className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                >
                  <Ban className="h-4 w-4" />
                  Cancel Match
                </button>
                <button
                  onClick={() => setShowEditModal(true)}
                  className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit Match
                </button>
              </>
            ) : (
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
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditModal && match && (
        <EditMatchModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            fetchMatch();
          }}
          match={match}
        />
      )}

      {showSquadModal && match && (
        <SquadSelectionModal
          isOpen={showSquadModal}
          onClose={() => setShowSquadModal(false)}
          onSuccess={() => {
            setShowSquadModal(false);
            fetchSquad();
          }}
          matchId={match.id}
          teamId={match.home_team_id}
        />
      )}
    </>
  );
}
