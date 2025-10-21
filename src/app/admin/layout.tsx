"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ProtectedRoute } from "@/components/auth";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Clubs", href: "/admin/clubs", icon: "⚽" },
  { name: "Users", href: "/admin/users", icon: "👥" },
  { name: "Settings", href: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { signOut, loading } = useAuth();
  const { user } = useUser();

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  return (
    <ProtectedRoute requireRole="super_admin">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Clubify.mk Admin
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {user?.email}
              </span>
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl">
          {/* Sidebar */}
          <aside className="w-64 border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <nav className="space-y-1 p-4">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
