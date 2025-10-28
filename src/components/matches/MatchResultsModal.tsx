"use client";

import { useState, useEffect } from "react";
import { X, Trophy, Save, Loader2 } from "lucide-react";

type Player = {
  id: string;
  first_name: string;
  last_name: string;
};

type SquadMember = {
  id: string;
  player_id: string;
  is_starting: boolean;
  jersey_number: number | null;
  players: Player;
};

type PlayerStat = {
  player_id: string;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  rating: number | null;
  notes: string;
};

type MatchResultsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  currentHomeScore?: number | null;
  currentAwayScore?: number | null;
};

export default function MatchResultsModal({
  isOpen,
  onClose,
  onSuccess,
  matchId,
  homeTeamName,
  awayTeamName,
  currentHomeScore,
  currentAwayScore,
}: MatchResultsModalProps) {
  const [homeScore, setHomeScore] = useState<number>(currentHomeScore || 0);
  const [awayScore, setAwayScore] = useState<number>(currentAwayScore || 0);
  const [squad, setSquad] = useState<SquadMember[]>([]);
  const [playerStats, setPlayerStats] = useState<Map<string, PlayerStat>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchSquad();
      fetchExistingStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, matchId]);

  const fetchSquad = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/matches/${matchId}/squad`);
      if (response.ok) {
        const data = await response.json();
        setSquad(data.squad || []);
        
        // Initialize stats for all squad members
        const initialStats = new Map<string, PlayerStat>();
        (data.squad || []).forEach((member: SquadMember) => {
          initialStats.set(member.player_id, {
            player_id: member.player_id,
            goals: 0,
            assists: 0,
            yellow_cards: 0,
            red_cards: 0,
            rating: null,
            notes: "",
          });
        });
        setPlayerStats(initialStats);
      }
    } catch (err) {
      console.error("Error fetching squad:", err);
      setError("Failed to load squad");
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingStats = async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}/results`);
      if (response.ok) {
        const data = await response.json();
        if (data.statistics && data.statistics.length > 0) {
          const existingStats = new Map<string, PlayerStat>();
          data.statistics.forEach((stat: {
            player_id: string;
            goals?: number;
            assists?: number;
            yellow_cards?: number;
            red_cards?: number;
            rating?: number;
            notes?: string;
          }) => {
            existingStats.set(stat.player_id, {
              player_id: stat.player_id,
              goals: stat.goals || 0,
              assists: stat.assists || 0,
              yellow_cards: stat.yellow_cards || 0,
              red_cards: stat.red_cards || 0,
              rating: stat.rating || null,
              notes: stat.notes || "",
            });
          });
          setPlayerStats(existingStats);
        }
      }
    } catch (err) {
      console.error("Error fetching existing stats:", err);
    }
  };

  const updatePlayerStat = (playerId: string, field: keyof PlayerStat, value: number | string | null) => {
    setPlayerStats((prev) => {
      const newStats = new Map(prev);
      const currentStat = newStats.get(playerId) || {
        player_id: playerId,
        goals: 0,
        assists: 0,
        yellow_cards: 0,
        red_cards: 0,
        rating: null,
        notes: "",
      };
      newStats.set(playerId, { ...currentStat, [field]: value });
      return newStats;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const stats = Array.from(playerStats.values()).filter(
        (stat) =>
          stat.goals > 0 ||
          stat.assists > 0 ||
          stat.yellow_cards > 0 ||
          stat.red_cards > 0 ||
          stat.rating !== null
      );

      const response = await fetch(`/api/matches/${matchId}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          home_score: homeScore,
          away_score: awayScore,
          player_stats: stats,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save match results");
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const result =
    homeScore > awayScore ? "Win" : homeScore < awayScore ? "Loss" : "Draw";
  const resultColor =
    result === "Win"
      ? "text-green-600 dark:text-green-400"
      : result === "Loss"
        ? "text-red-600 dark:text-red-400"
        : "text-gray-600 dark:text-gray-400";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Enter Match Results
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Record the final score and player statistics
            </p>
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
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          {/* Score Entry */}
          <div className="mb-8 rounded-lg border border-gray-200 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900/50">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
              <Trophy className="h-5 w-5" />
              Final Score
            </h3>
            <div className="flex items-center justify-center gap-8">
              <div className="flex-1 text-center">
                <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {homeTeamName}
                </div>
                <input
                  type="number"
                  min="0"
                  value={homeScore}
                  onChange={(e) => setHomeScore(parseInt(e.target.value) || 0)}
                  className="w-24 rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-3xl font-bold text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="text-3xl font-bold text-gray-400">-</div>
              <div className="flex-1 text-center">
                <div className="mb-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                  {awayTeamName}
                </div>
                <input
                  type="number"
                  min="0"
                  value={awayScore}
                  onChange={(e) => setAwayScore(parseInt(e.target.value) || 0)}
                  className="w-24 rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-3xl font-bold text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className={`mt-4 text-center text-xl font-semibold ${resultColor}`}>
              Result: {result}
            </div>
          </div>

          {/* Player Statistics */}
          <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="border-b border-gray-200 p-4 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Player Statistics
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Only enter stats for players who contributed (leave others at 0)
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-green-600" />
              </div>
            ) : squad.length === 0 ? (
              <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                No squad selected for this match
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Player
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Goals
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Assists
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Yellow
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Red
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                        Rating
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {squad.map((member) => {
                      const stats = playerStats.get(member.player_id) || {
                        player_id: member.player_id,
                        goals: 0,
                        assists: 0,
                        yellow_cards: 0,
                        red_cards: 0,
                        rating: null,
                        notes: "",
                      };

                      return (
                        <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {member.jersey_number && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                  {member.jersey_number}
                                </div>
                              )}
                              <span className="font-medium text-gray-900 dark:text-white">
                                {member.players.first_name} {member.players.last_name}
                              </span>
                              {member.is_starting && (
                                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                  Starting
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              value={stats.goals}
                              onChange={(e) =>
                                updatePlayerStat(
                                  member.player_id,
                                  "goals",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              value={stats.assists}
                              onChange={(e) =>
                                updatePlayerStat(
                                  member.player_id,
                                  "assists",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              value={stats.yellow_cards}
                              onChange={(e) =>
                                updatePlayerStat(
                                  member.player_id,
                                  "yellow_cards",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max="1"
                              value={stats.red_cards}
                              onChange={(e) =>
                                updatePlayerStat(
                                  member.player_id,
                                  "red_cards",
                                  parseInt(e.target.value) || 0
                                )
                              }
                              className="w-16 rounded border border-gray-300 px-2 py-1 text-center text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max="10"
                              step="0.1"
                              value={stats.rating || ""}
                              onChange={(e) =>
                                updatePlayerStat(
                                  member.player_id,
                                  "rating",
                                  e.target.value ? parseFloat(e.target.value) : null
                                )
                              }
                              placeholder="0-10"
                              className="w-20 rounded border border-gray-300 px-2 py-1 text-center text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <button
            onClick={onClose}
            disabled={saving}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Results
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
