"use client";

import { useEffect, useState } from "react";
import { DollarSign, Users, TrendingUp, Calendar, Receipt } from "lucide-react";
import SetFeeModal from "@/components/payments/SetFeeModal";
import GeneratePaymentsModal from "@/components/payments/GeneratePaymentsModal";

type Team = {
  id: string;
  name: string;
  age_group: string | null;
  player_count: number;
  subscription_fee: {
    id: string;
    amount: number;
    effective_from: string;
  } | null;
};

type Props = {
  clubId: string;
};

export default function SubscriptionFeesClient({ clubId }: Props) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSetFeeModal, setShowSetFeeModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  useEffect(() => {
    fetchTeams();
  }, [clubId]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/club/subscription-fees?clubId=${clubId}`);
      if (!response.ok) throw new Error("Failed to fetch teams");
      const data = await response.json();
      setTeams(data.teams || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSetFee = (team: Team) => {
    setSelectedTeam(team);
    setShowSetFeeModal(true);
  };

  const handleCloseModal = () => {
    setShowSetFeeModal(false);
    setSelectedTeam(null);
  };

  const handleFeeUpdated = () => {
    fetchTeams();
    handleCloseModal();
  };

  // Calculate statistics
  const totalTeams = teams.length;
  const teamsWithFees = teams.filter((t) => t.subscription_fee).length;
  const totalMonthlyRevenue = teams.reduce((sum, team) => {
    if (team.subscription_fee) {
      return sum + team.subscription_fee.amount * team.player_count;
    }
    return sum;
  }, 0);

  if (loading) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subscription Fees
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage monthly subscription fees for each team
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/club/${clubId}/payments/records`}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            View Payment Records
          </a>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
          >
            <Receipt className="h-5 w-5" />
            Generate Payments
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Teams
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {totalTeams}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Teams with Fees
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {teamsWithFees}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {totalTeams > 0
                  ? `${Math.round((teamsWithFees / totalTeams) * 100)}% configured`
                  : "No teams"}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Monthly Revenue
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {totalMonthlyRevenue.toLocaleString()} MKD
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Teams Table */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Age Group
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Current Fee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Effective From
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Players
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Monthly Revenue
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {teams.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="mb-3 h-12 w-12 text-gray-400 dark:text-gray-600" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        No teams found. Create teams first to set subscription fees.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                teams.map((team) => {
                  const monthlyRevenue = team.subscription_fee
                    ? team.subscription_fee.amount * team.player_count
                    : 0;

                  return (
                    <tr
                      key={team.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-900/30"
                    >
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {team.name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {team.age_group || "-"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {team.subscription_fee ? (
                          <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="font-medium">
                              {team.subscription_fee.amount.toLocaleString()} MKD
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-600">
                            Not set
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {team.subscription_fee
                            ? new Date(
                                team.subscription_fee.effective_from
                              ).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {team.player_count}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {monthlyRevenue.toLocaleString()} MKD
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <button
                          onClick={() => handleSetFee(team)}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                        >
                          {team.subscription_fee ? "Update Fee" : "Set Fee"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Set Fee Modal */}
      {showSetFeeModal && selectedTeam && (
        <SetFeeModal
          team={selectedTeam}
          clubId={clubId}
          onClose={handleCloseModal}
          onSuccess={handleFeeUpdated}
        />
      )}

      {/* Generate Payments Modal */}
      {showGenerateModal && (
        <GeneratePaymentsModal
          clubId={clubId}
          onClose={() => setShowGenerateModal(false)}
          onSuccess={() => {
            setShowGenerateModal(false);
            // Optionally navigate to payment records page
          }}
        />
      )}
    </div>
  );
}
