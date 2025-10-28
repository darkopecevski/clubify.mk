"use client";

import { useState, useEffect } from "react";
import { X, Users, Save, Loader2 } from "lucide-react";

type Player = {
  id: string;
  first_name: string;
  last_name: string;
  position: string | null;
  is_active: boolean;
};

type SquadPlayer = {
  player_id: string;
  is_starting: boolean;
  jersey_number: number | null;
  position: string | null;
  notes: string | null;
};

type SquadSelectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  matchId: string;
  teamId: string;
};

export default function SquadSelectionModal({
  isOpen,
  onClose,
  onSuccess,
  matchId,
  teamId,
}: SquadSelectionModalProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [squad, setSquad] = useState<SquadPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPlayers();
      fetchSquad();
    }
  }, [isOpen, matchId, teamId]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teams/${teamId}/players`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch players");
      }

      const data = await response.json();
      const activePlayers = (data.players || [])
        .map((tp: { players: Player }) => tp.players)
        .filter((p: Player) => p.is_active);

      setPlayers(activePlayers);
    } catch (err) {
      console.error("Error fetching players:", err);
      setError(err instanceof Error ? err.message : "Failed to load players");
    } finally {
      setLoading(false);
    }
  };

  const fetchSquad = async () => {
    try {
      const response = await fetch(`/api/matches/${matchId}/squad`);
      if (!response.ok) throw new Error("Failed to fetch squad");

      const data = await response.json();
      setSquad(
        (data.squad || []).map((s: {
          player_id: string;
          is_starting: boolean;
          jersey_number: number | null;
          position: string | null;
          notes: string | null;
        }) => ({
          player_id: s.player_id,
          is_starting: s.is_starting,
          jersey_number: s.jersey_number,
          position: s.position,
          notes: s.notes,
        }))
      );
    } catch (err) {
      console.error("Error fetching squad:", err);
    }
  };

  const isPlayerInSquad = (playerId: string) => {
    return squad.some((s) => s.player_id === playerId);
  };

  const isPlayerStarting = (playerId: string) => {
    return squad.find((s) => s.player_id === playerId)?.is_starting || false;
  };

  const getPlayerSquadData = (playerId: string) => {
    return squad.find((s) => s.player_id === playerId);
  };

  const togglePlayerInSquad = (playerId: string) => {
    if (isPlayerInSquad(playerId)) {
      setSquad(squad.filter((s) => s.player_id !== playerId));
    } else {
      setSquad([
        ...squad,
        {
          player_id: playerId,
          is_starting: false,
          jersey_number: null,
          position: null,
          notes: null,
        },
      ]);
    }
  };

  const toggleStarting = (playerId: string) => {
    setSquad(
      squad.map((s) =>
        s.player_id === playerId ? { ...s, is_starting: !s.is_starting } : s
      )
    );
  };

  const updateSquadPlayer = (
    playerId: string,
    field: keyof SquadPlayer,
    value: string | number | null
  ) => {
    setSquad(
      squad.map((s) =>
        s.player_id === playerId ? { ...s, [field]: value || null } : s
      )
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/matches/${matchId}/squad`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ squad }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save squad");
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

  const startingCount = squad.filter((s) => s.is_starting).length;
  const totalSelected = squad.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Squad Selection
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select players for this match. Choose starting 11 and substitutes.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="border-b border-gray-200 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-900/50">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">
                Total Selected:
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {totalSelected}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">
                Starting 11:
              </span>
              <span
                className={`font-semibold ${
                  startingCount === 11
                    ? "text-green-600 dark:text-green-400"
                    : startingCount > 11
                      ? "text-red-600 dark:text-red-400"
                      : "text-orange-600 dark:text-orange-400"
                }`}
              >
                {startingCount}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 dark:text-gray-400">Subs:</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {totalSelected - startingCount}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          ) : players.length === 0 ? (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">
              No active players found in this team
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      <input
                        type="checkbox"
                        checked={totalSelected === players.length && players.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSquad(
                              players.map((p) => ({
                                player_id: p.id,
                                is_starting: false,
                                jersey_number: null,
                                position: p.position,
                                notes: null,
                              }))
                            );
                          } else {
                            setSquad([]);
                          }
                        }}
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Player
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Position
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Starting 11
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Jersey #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {players.map((player) => {
                    const inSquad = isPlayerInSquad(player.id);
                    const squadData = getPlayerSquadData(player.id);
                    return (
                      <tr
                        key={player.id}
                        className={`${
                          inSquad
                            ? "bg-green-50 dark:bg-green-900/10"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={inSquad}
                            onChange={() => togglePlayerInSquad(player.id)}
                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                          {player.first_name} {player.last_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {squadData?.position || player.position || "-"}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            disabled={!inSquad}
                            checked={isPlayerStarting(player.id)}
                            onChange={() => toggleStarting(player.id)}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-50"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            disabled={!inSquad}
                            min="1"
                            max="99"
                            value={squadData?.jersey_number || ""}
                            onChange={(e) =>
                              updateSquadPlayer(
                                player.id,
                                "jersey_number",
                                e.target.value ? parseInt(e.target.value) : null
                              )
                            }
                            className="w-20 rounded border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            disabled={!inSquad}
                            value={squadData?.notes || ""}
                            onChange={(e) =>
                              updateSquadPlayer(player.id, "notes", e.target.value)
                            }
                            placeholder="Optional notes"
                            className="w-full rounded border border-gray-300 px-2 py-1 text-sm disabled:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:disabled:bg-gray-800"
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

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-gray-200 p-6 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {startingCount !== 11 && totalSelected > 0 && (
              <span className="text-orange-600 dark:text-orange-400">
                ⚠ Please select exactly 11 starting players
              </span>
            )}
          </div>
          <div className="flex gap-3">
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
                  Save Squad
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
