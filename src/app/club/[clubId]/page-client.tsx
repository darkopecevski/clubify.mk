"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Users, UserSquare2, Trophy, Calendar, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Match = {
  id: string;
  match_date: string;
  start_time: string;
  location: string;
  away_team_name: string | null;
  competition: string | null;
  teams?: { name: string };
};

type Player = {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
};

type DashboardStats = {
  teams: number;
  players: number;
  coaches: number;
  upcomingMatches: Match[];
  recentPlayers: Player[];
};

export default function ClubDashboardPage({ clubId }: { clubId: string }) {
  const [clubName, setClubName] = useState<string>("");

  const statCards = [
    {
      name: "Total Teams",
      key: "teams" as const,
      icon: Users,
      iconBg: "bg-blue-100 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
      href: `/club/${clubId}/teams`,
      trend: { value: "+2 this season", isPositive: true },
    },
    {
      name: "Total Players",
      key: "players" as const,
      icon: UserSquare2,
      iconBg: "bg-purple-100 dark:bg-purple-900/20",
      iconColor: "text-purple-600 dark:text-purple-400",
      href: `/club/${clubId}/players`,
      trend: { value: "+15 this month", isPositive: true },
    },
    {
      name: "Total Coaches",
      key: "coaches" as const,
      icon: Users,
      iconBg: "bg-green-100 dark:bg-green-900/20",
      iconColor: "text-green-600 dark:text-green-400",
      href: `/club/${clubId}/coaches`,
      trend: { value: "+1 this month", isPositive: true },
    },
    {
      name: "Upcoming Events",
      key: "upcomingMatches" as const,
      icon: Calendar,
      iconBg: "bg-orange-100 dark:bg-orange-900/20",
      iconColor: "text-orange-600 dark:text-orange-400",
      href: `/club/${clubId}/matches`,
      trend: { value: "Next 7 days", isPositive: true },
    },
  ];
  const [stats, setStats] = useState<DashboardStats>({
    teams: 0,
    players: 0,
    coaches: 0,
    upcomingMatches: [],
    recentPlayers: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      const supabase = createClient();

      try {
        // Get club name
        const { data: clubData } = await supabase
          .from("clubs")
          .select("name")
          .eq("id", clubId)
          .single();

        if (clubData) {
          setClubName(clubData.name);
        }

        // Get teams count
        const { count: teamsCount } = await supabase
          .from("teams")
          .select("*", { count: "exact", head: true })
          .eq("club_id", clubId);

        // Get team IDs for player count
        const { data: teams } = await supabase
          .from("teams")
          .select("id")
          .eq("club_id", clubId);

        const teamIds = teams?.map(t => t.id) || [];
        let playersCount = 0;

        if (teamIds.length > 0) {
          const { count } = await supabase
            .from("team_players")
            .select("player_id", { count: "exact", head: true })
            .in("team_id", teamIds)
            .is("left_at", null);
          playersCount = count || 0;
        }

        // Get coaches count
        const { count: coachesCount } = await supabase
          .from("coaches")
          .select("*", { count: "exact", head: true })
          .eq("club_id", clubId);

        // Get upcoming matches
        const today = new Date().toISOString().split("T")[0];
        const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

        const { data: upcomingMatches } = await supabase
          .from("matches")
          .select(`
            *,
            teams!inner(club_id, name)
          `)
          .eq("teams.club_id", clubId)
          .gte("match_date", today)
          .lte("match_date", nextWeek)
          .order("match_date", { ascending: true })
          .limit(5);

        // Get recent players
        const { data: recentPlayers } = await supabase
          .from("players")
          .select("id, first_name, last_name, created_at")
          .eq("club_id", clubId)
          .order("created_at", { ascending: false })
          .limit(5);

        setStats({
          teams: teamsCount || 0,
          players: playersCount,
          coaches: coachesCount || 0,
          upcomingMatches: upcomingMatches || [],
          recentPlayers: recentPlayers || [],
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [clubId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            {clubName}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Welcome back! Here&apos;s what&apos;s happening with your club today.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/club/${clubId}/players/create`}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            <Plus className="h-4 w-4" />
            Add Player
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          let value: number;

          if (card.key === "upcomingMatches") {
            value = stats[card.key].length;
          } else {
            value = stats[card.key];
          }

          return (
            <div
              key={card.name}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {card.name}
                    </p>
                    <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                      {value.toLocaleString()}
                    </p>
                  </div>
                  <div className={`rounded-xl p-3 ${card.iconBg}`}>
                    <Icon className={`h-6 w-6 ${card.iconColor}`} />
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-sm">
                    <span className="text-gray-500 dark:text-gray-400">{card.trend.value}</span>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-900/50">
                <Link
                  href={card.href}
                  className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                >
                  View details →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Matches */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Upcoming Matches
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Matches scheduled for the next 7 days
          </p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {stats.upcomingMatches.length > 0 ? (
            stats.upcomingMatches.map((match, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 text-sm font-semibold text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {match.teams?.name || "Team"} vs {match.away_team_name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {match.location} • {match.competition || "Friendly"}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {new Date(match.match_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {match.start_time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No upcoming matches in the next 7 days.
              </p>
              <Link
                href={`/club/${clubId}/matches/new`}
                className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Schedule Match
              </Link>
            </div>
          )}
        </div>
        {stats.upcomingMatches.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-900/50">
            <Link
              href={`/club/${clubId}/matches`}
              className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              View all matches →
            </Link>
          </div>
        )}
      </div>

      {/* Recent Players */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recently Added Players
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Latest players added to your club
          </p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {stats.recentPlayers.length > 0 ? (
            stats.recentPlayers.map((player, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-sm font-semibold text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                    {player.first_name.charAt(0)}
                    {player.last_name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {player.first_name} {player.last_name}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(player.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No players yet. Add your first player to get started.
              </p>
              <Link
                href={`/club/${clubId}/players/create`}
                className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Add Player
              </Link>
            </div>
          )}
        </div>
        {stats.recentPlayers.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-900/50">
            <Link
              href={`/club/${clubId}/players`}
              className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              View all players →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
