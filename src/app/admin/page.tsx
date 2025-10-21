import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Overview of your Clubify.mk system
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Clubs Card */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Clubs
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.clubs}
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/20">
                <span className="text-2xl">⚽</span>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/admin/clubs"
                className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                View all clubs →
              </Link>
            </div>
          </div>
        </div>

        {/* Users Card */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.users}
                </p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/20">
                <span className="text-2xl">👥</span>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href="/admin/users"
                className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
              >
                View all users →
              </Link>
            </div>
          </div>
        </div>

        {/* Players Card */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Players
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.players}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/20">
                <span className="text-2xl">🏃</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Across all clubs
              </span>
            </div>
          </div>
        </div>

        {/* Teams Card */}
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Teams
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats.teams}
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/20">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Active teams
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
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
            stats.recentClubs.map((club, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-6"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {club.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {club.city}
                  </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(club.created_at).toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No clubs yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
