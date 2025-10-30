"use client";

import { useState } from "react";
import { X } from "lucide-react";

type Team = {
  id: string;
  name: string;
  age_group: string | null;
  subscription_fee: {
    id: string;
    amount: number;
    effective_from: string;
  } | null;
};

type Props = {
  team: Team;
  clubId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function SetFeeModal({ team, clubId, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState(
    team.subscription_fee?.amount.toString() || ""
  );
  const [effectiveFrom, setEffectiveFrom] = useState(
    team.subscription_fee?.effective_from || new Date().toISOString().split("T")[0]
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (!effectiveFrom) {
      setError("Please select an effective date");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/club/subscription-fees`, {
        method: team.subscription_fee ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clubId,
          teamId: team.id,
          amount: amountNum,
          effectiveFrom,
          feeId: team.subscription_fee?.id,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save fee");
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {team.subscription_fee ? "Update" : "Set"} Subscription Fee
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {team.name}
              {team.age_group && ` (${team.age_group})`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Amount */}
            <div>
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Monthly Amount (MKD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g., 3000"
                min="0"
                step="0.01"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Enter the monthly subscription fee in Macedonian Denars
              </p>
            </div>

            {/* Effective From */}
            <div>
              <label
                htmlFor="effectiveFrom"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Effective From <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="effectiveFrom"
                value={effectiveFrom}
                onChange={(e) => setEffectiveFrom(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {team.subscription_fee
                  ? "Select a future date to schedule a fee change"
                  : "Date when this fee becomes active"}
              </p>
            </div>

            {/* Fee History Info */}
            {team.subscription_fee && (
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Current Fee:</strong>{" "}
                  {team.subscription_fee.amount.toLocaleString()} MKD
                  <br />
                  <strong>Effective Since:</strong>{" "}
                  {new Date(team.subscription_fee.effective_from).toLocaleDateString(
                    "en-GB",
                    {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
            >
              {loading ? "Saving..." : team.subscription_fee ? "Update Fee" : "Set Fee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
