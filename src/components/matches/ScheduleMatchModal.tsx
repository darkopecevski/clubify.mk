"use client";

import { useState } from "react";
import { X, Calendar, Clock, MapPin, Trophy, FileText } from "lucide-react";

type Team = {
  id: string;
  name: string;
  age_group: string;
};

type ScheduleMatchModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  teams: Team[];
};

export default function ScheduleMatchModal({
  isOpen,
  onClose,
  onSuccess,
  teams,
}: ScheduleMatchModalProps) {
  const [formData, setFormData] = useState({
    home_team_id: "",
    away_team_name: "",
    match_date: "",
    start_time: "",
    location: "",
    competition: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to schedule match");
      }

      onSuccess();
      onClose();
      // Reset form
      setFormData({
        home_team_id: "",
        away_team_name: "",
        match_date: "",
        start_time: "",
        location: "",
        competition: "",
        notes: "",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Schedule Match
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Team Selection */}
            <div>
              <label
                htmlFor="home_team_id"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Team <span className="text-red-500">*</span>
              </label>
              <select
                id="home_team_id"
                required
                value={formData.home_team_id}
                onChange={(e) =>
                  setFormData({ ...formData, home_team_id: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.age_group})
                  </option>
                ))}
              </select>
            </div>

            {/* Opponent */}
            <div>
              <label
                htmlFor="away_team_name"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Opponent <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="away_team_name"
                required
                placeholder="Enter opponent team name"
                value={formData.away_team_name}
                onChange={(e) =>
                  setFormData({ ...formData, away_team_name: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            {/* Date and Time */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="match_date"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <Calendar className="mr-1 inline h-4 w-4" />
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="match_date"
                  required
                  value={formData.match_date}
                  onChange={(e) =>
                    setFormData({ ...formData, match_date: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="start_time"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  <Clock className="mr-1 inline h-4 w-4" />
                  Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  id="start_time"
                  required
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <MapPin className="mr-1 inline h-4 w-4" />
                Location/Venue <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="location"
                required
                placeholder="Enter venue or location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            {/* Competition */}
            <div>
              <label
                htmlFor="competition"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <Trophy className="mr-1 inline h-4 w-4" />
                Competition Type
              </label>
              <select
                id="competition"
                value={formData.competition}
                onChange={(e) =>
                  setFormData({ ...formData, competition: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select type</option>
                <option value="Friendly">Friendly</option>
                <option value="League">League</option>
                <option value="Cup">Cup</option>
                <option value="Tournament">Tournament</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                <FileText className="mr-1 inline h-4 w-4" />
                Notes (optional)
              </label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Add any additional notes or details"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
            >
              {loading ? "Scheduling..." : "Schedule Match"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
