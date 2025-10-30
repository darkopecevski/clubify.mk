"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Search,
} from "lucide-react";
import MarkAsPaidModal from "@/components/payments/MarkAsPaidModal";

type PaymentRecord = {
  id: string;
  period_month: number;
  period_year: number;
  amount_due: number;
  amount_paid: number;
  discount_applied: number;
  status: "unpaid" | "partial" | "paid" | "overdue" | "waived";
  due_date: string;
  paid_date: string | null;
  payment_method: string | null;
  notes: string | null;
  player: {
    id: string;
    first_name: string;
    last_name: string;
    jersey_number: number | null;
  };
  team: {
    id: string;
    name: string;
    age_group: string | null;
  };
};

type Props = {
  clubId: string;
};

export default function PaymentRecordsClient({ clubId }: Props) {
  const [records, setRecords] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1);
  const [year, setYear] = useState(currentDate.getFullYear());
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Teams for filter
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([]);

  // Modal state
  const [showMarkAsPaidModal, setShowMarkAsPaidModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null);

  useEffect(() => {
    fetchTeams();
  }, [clubId]);

  useEffect(() => {
    fetchRecords();
  }, [clubId, month, year, teamFilter, statusFilter]);

  const fetchTeams = async () => {
    try {
      const response = await fetch(`/api/club/subscription-fees?clubId=${clubId}`);
      if (!response.ok) throw new Error("Failed to fetch teams");
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (err) {
      console.error("Error fetching teams:", err);
    }
  };

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        clubId,
        month: month.toString(),
        year: year.toString(),
      });

      if (teamFilter !== "all") {
        params.append("teamId", teamFilter);
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      const response = await fetch(`/api/club/payments?${params.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch payment records");
      const data = await response.json();
      setRecords(data.records || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsPaid = (record: PaymentRecord) => {
    setSelectedRecord(record);
    setShowMarkAsPaidModal(true);
  };

  const handlePaymentUpdated = () => {
    fetchRecords();
    setShowMarkAsPaidModal(false);
    setSelectedRecord(null);
  };

  // Filter records by search query
  const filteredRecords = records.filter((record) => {
    const fullName =
      `${record.player.first_name} ${record.player.last_name}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  // Calculate statistics
  const totalAmountDue = filteredRecords.reduce(
    (sum, r) => sum + Number(r.amount_due),
    0
  );
  const totalCollected = filteredRecords.reduce(
    (sum, r) => sum + Number(r.amount_paid),
    0
  );
  const outstandingBalance = totalAmountDue - totalCollected;
  const collectionRate =
    totalAmountDue > 0 ? (totalCollected / totalAmountDue) * 100 : 0;

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

  const statusColors = {
    paid: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300",
    unpaid:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300",
    partial:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300",
    overdue: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300",
    waived: "bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300",
  };

  if (loading && records.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-red-700 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payment Records
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Track and manage player payments
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Due
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {totalAmountDue.toLocaleString()} MKD
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Collected
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {totalCollected.toLocaleString()} MKD
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Outstanding
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {outstandingBalance.toLocaleString()} MKD
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <AlertCircle className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Collection Rate
              </p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                {collectionRate.toFixed(1)}%
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Month */}
        <select
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {months.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        {/* Year */}
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        {/* Team Filter */}
        <select
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Teams</option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-gray-300 px-4 py-2 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Partial</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
          <option value="waived">Waived</option>
        </select>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by player name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Payment Records Table */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Player
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Amount Due
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Amount Paid
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Due Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <DollarSign className="mb-3 h-12 w-12 text-gray-400 dark:text-gray-600" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No payment records found for this period.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {record.player.first_name} {record.player.last_name}
                        </div>
                        {record.player.jersey_number && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            #{record.player.jersey_number}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {record.team.name}
                      </div>
                      {record.team.age_group && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {record.team.age_group}
                        </div>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-sm text-gray-900 dark:text-white">
                        {months[record.period_month - 1].label} {record.period_year}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {Number(record.amount_due).toLocaleString()} MKD
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-gray-900 dark:text-white">
                        {Number(record.amount_paid).toLocaleString()} MKD
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          statusColors[record.status]
                        }`}
                      >
                        {record.status.charAt(0).toUpperCase() +
                          record.status.slice(1)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(record.due_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      {record.status !== "paid" && record.status !== "waived" && (
                        <button
                          onClick={() => handleMarkAsPaid(record)}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                        >
                          Mark as Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mark as Paid Modal */}
      {showMarkAsPaidModal && selectedRecord && (
        <MarkAsPaidModal
          record={selectedRecord}
          onClose={() => {
            setShowMarkAsPaidModal(false);
            setSelectedRecord(null);
          }}
          onSuccess={handlePaymentUpdated}
        />
      )}
    </div>
  );
}
