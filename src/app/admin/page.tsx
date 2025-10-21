import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Building2, Users, Trophy, UserSquare2, TrendingUp, TrendingDown } from "lucide-react";

async function getDashboardStats() {
  const supabase = await createClient();

  // Get total clubs
  const { count: clubsCount } = await supabase
    .from("clubs")
    .select("*", { count: "exact", head: true });

  // Get total users
  const { count: usersCount } = await supabase
    .from("users")
    .select("*", { count: "exact", head: true });

  // Get total players
  const { count: playersCount } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true });

  // Get total teams
  const { count: teamsCount } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true });

  // Get recent clubs
  const { data: recentClubs } = await supabase
    .from("clubs")
    .select("name, city, created_at")
    .order("created_at", { ascending: false })
    .limit(5);

  return {
    clubs: clubsCount || 0,
    users: usersCount || 0,
    players: playersCount || 0,
    teams: teamsCount || 0,
    recentClubs: recentClubs || [],
  };
}

const statCards = [
  {
    name: "Total Clubs",
    key: "clubs" as const,
    icon: Building2,
    iconBg: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-400",
    href: "/admin/clubs",
    trend: { value: "+12.5%", isPositive: true },
  },
  {
    name: "Total Users",
    key: "users" as const,
    icon: Users,
    iconBg: "bg-green-100 dark:bg-green-900/20",
    iconColor: "text-green-600 dark:text-green-400",
    href: "/admin/users",
    trend: { value: "+23.1%", isPositive: true },
  },
  {
    name: "Total Players",
    key: "players" as const,
    icon: UserSquare2,
    iconBg: "bg-purple-100 dark:bg-purple-900/20",
    iconColor: "text-purple-600 dark:text-purple-400",
    href: "/admin",
    trend: { value: "+8.2%", isPositive: true },
  },
  {
    name: "Total Teams",
    key: "teams" as const,
    icon: Trophy,
    iconBg: "bg-orange-100 dark:bg-orange-900/20",
    iconColor: "text-orange-600 dark:text-orange-400",
    href: "/admin",
    trend: { value: "-2.1%", isPositive: false },
  },
];

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Welcome back! Here&apos;s what&apos;s happening with your clubs today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const TrendIcon = card.trend.isPositive ? TrendingUp : TrendingDown;
          const value = stats[card.key];

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
                    <TrendIcon
                      className={`h-4 w-4 ${
                        card.trend.isPositive
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        card.trend.isPositive
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {card.trend.value}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">vs last month</span>
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

      {/* Recent Activity */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 p-6 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Clubs
          </h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Latest clubs added to the system
          </p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {stats.recentClubs.length > 0 ? (
            stats.recentClubs.map((club, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                    {club.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {club.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {club.city}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(club.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No clubs yet. Add your first club to get started.
              </p>
              <Link
                href="/admin/clubs/new"
                className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
              >
                Add Club
              </Link>
            </div>
          )}
        </div>
        {stats.recentClubs.length > 0 && (
          <div className="border-t border-gray-100 bg-gray-50 px-6 py-3 dark:border-gray-700 dark:bg-gray-900/50">
            <Link
              href="/admin/clubs"
              className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
            >
              View all clubs →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
