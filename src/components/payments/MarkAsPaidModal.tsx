"use client";

import { useState } from "react";
import { X } from "lucide-react";

type PaymentRecord = {
  id: string;
  amount_due: number;
  amount_paid: number;
  player: {
    first_name: string;
    last_name: string;
  };
  team: {
    name: string;
  };
};

type Props = {
  record: PaymentRecord;
  onClose: () => void;
  onSuccess: () => void;
};

export default function MarkAsPaidModal({ record, onClose, onSuccess }: Props) {
  const remainingAmount = Number(record.amount_due) - Number(record.amount_paid);
  const [amountPaid, setAmountPaid] = useState(remainingAmount.toString());
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [paymentDate, setPaymentDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [transactionReference, setTransactionReference] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(amountPaid);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    if (!paymentDate) {
      setError("Please select a payment date");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/club/payments/${record.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amountPaid: Number(record.amount_paid) + amountNum,
          paymentMethod,
          paymentDate,
          transactionReference: transactionReference || null,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update payment");
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
              Mark Payment as Paid
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {record.player.first_name} {record.player.last_name} -{" "}
              {record.team.name}
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
            {/* Payment Summary */}
            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">
                    Total Amount Due:
                  </span>
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    {Number(record.amount_due).toLocaleString()} MKD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700 dark:text-blue-300">
                    Already Paid:
                  </span>
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    {Number(record.amount_paid).toLocaleString()} MKD
                  </span>
                </div>
                <div className="flex justify-between border-t border-blue-200 pt-1 dark:border-blue-800">
                  <span className="font-medium text-blue-700 dark:text-blue-300">
                    Remaining:
                  </span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">
                    {remainingAmount.toLocaleString()} MKD
                  </span>
                </div>
              </div>
            </div>

            {/* Amount Paid */}
            <div>
              <label
                htmlFor="amountPaid"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Amount Paid <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="amountPaid"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Can be partial payment or full remaining amount
              </p>
            </div>

            {/* Payment Method */}
            <div>
              <label
                htmlFor="paymentMethod"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="cash">Cash</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Payment Date */}
            <div>
              <label
                htmlFor="paymentDate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Payment Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="paymentDate"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Transaction Reference */}
            <div>
              <label
                htmlFor="transactionReference"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Transaction Reference
              </label>
              <input
                type="text"
                id="transactionReference"
                value={transactionReference}
                onChange={(e) => setTransactionReference(e.target.value)}
                placeholder="e.g., Check #, Receipt #, Transaction ID"
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Notes */}
            <div>
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes..."
                rows={3}
                className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>

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
              {loading ? "Saving..." : "Record Payment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
