"use client";

import { useState } from "react";
import { X, AlertCircle } from "lucide-react";

type Props = {
  clubId: string;
  onClose: () => void;
  onSuccess: () => void;
};

export default function GeneratePaymentsModal({
  clubId,
  onClose,
  onSuccess,
}: Props) {
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    inserted: number;
    skipped: number;
    teamsWithoutFees: string[];
  } | null>(null);

  const months = [
    { value: 1, label: "January" },
    { value: 2, label: "February" },
    { value: 3, label: "March" },
    { value: 4, label: "April" },
    { value: 5, label: "May" },
    { value: 6, label: "June" },
    { value: 7, label: "July" },
    { value: 8, label: "August" },
    { value: 9, label: "September" },
    { value: 10, label: "October" },
    { value: 11, label: "November" },
    { value: 12, label: "December" },
  ];

  const years = Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() + i);

  const handleGenerate = async () => {
    setError(null);
    setResult(null);

    try {
      setLoading(true);
      const response = await fetch(`/api/club/payments/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clubId,
          month,
          year,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate payments");
      }

      setResult({
        inserted: data.inserted,
        skipped: data.skipped,
        teamsWithoutFees: data.teamsWithoutFees || [],
      });

      if (data.inserted > 0) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
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
              Generate Payment Records
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Create payment records for all active players
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
          {!result ? (
            <div className="space-y-4">
              {/* Month Selection */}
              <div>
                <label
                  htmlFor="month"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Month <span className="text-red-500">*</span>
                </label>
                <select
                  id="month"
                  value={month}
                  onChange={(e) => setMonth(parseInt(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {months.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Year Selection */}
              <div>
                <label
                  htmlFor="year"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  id="year"
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              {/* Info Box */}
              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> This will create payment records for all
                  active players in teams with configured subscription fees. Due date
                  will be set to the 5th of the selected month.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
                  <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Success Message */}
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                <p className="text-sm font-medium text-green-700 dark:text-green-300">
                  Successfully generated {result.inserted} payment records!
                </p>
                {result.skipped > 0 && (
                  <p className="mt-1 text-sm text-green-600 dark:text-green-400">
                    Skipped {result.skipped} existing records (already generated).
                  </p>
                )}
              </div>

              {/* Teams Without Fees Warning */}
              {result.teamsWithoutFees.length > 0 && (
                <div className="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-900/20">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-orange-600 dark:text-orange-400" />
                    <div>
                      <p className="text-sm font-medium text-orange-700 dark:text-orange-300">
                        Teams Without Fees
                      </p>
                      <p className="mt-1 text-sm text-orange-600 dark:text-orange-400">
                        The following teams don&apos;t have subscription fees configured:
                      </p>
                      <ul className="mt-2 list-inside list-disc text-sm text-orange-600 dark:text-orange-400">
                        {result.teamsWithoutFees.map((team, index) => (
                          <li key={index}>{team}</li>
                        ))}
                      </ul>
                      <p className="mt-2 text-sm text-orange-600 dark:text-orange-400">
                        Please set fees for these teams to generate payments.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-end gap-3">
            {!result ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
                >
                  {loading ? "Generating..." : "Generate Payments"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
