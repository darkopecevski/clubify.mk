"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { ProtectedRoute } from "@/components/auth";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  Users,
  UserSquare2,
  Trophy,
  Calendar,
  DollarSign,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  Building2,
  ArrowLeft,
} from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";

type Club = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  logo_url: string | null;
};

function ClubLayoutInner({
  children,
  clubId,
}: {
  children: React.ReactNode;
  clubId: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, loading: authLoading } = useAuth();
  const { user } = useUser();
  const { theme, setTheme } = useTheme();
  const { isSuperAdmin, clubIds } = useUserRole();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [clubSelectorOpen, setClubSelectorOpen] = useState(false);
  const [currentClub, setCurrentClub] = useState<Club | null>(null);
  const [availableClubs, setAvailableClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  const navigation = [
    { name: "Dashboard", href: `/club/${clubId}`, icon: LayoutDashboard },
    { name: "Teams", href: `/club/${clubId}/teams`, icon: Users },
    { name: "Players", href: `/club/${clubId}/players`, icon: UserSquare2 },
    { name: "Coaches", href: `/club/${clubId}/coaches`, icon: Users },
    { name: "Matches", href: `/club/${clubId}/matches`, icon: Trophy },
    { name: "Training", href: `/club/${clubId}/training`, icon: Calendar },
    { name: "Payments", href: `/club/${clubId}/payments`, icon: DollarSign },
    { name: "Settings", href: `/club/${clubId}/settings`, icon: Settings },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function validateAccess() {
      if (!user) return;

      const supabase = createClient();

      try {
        // Fetch current club
        const { data: clubData } = await supabase
          .from("clubs")
          .select("id, name, slug, city, logo_url")
          .eq("id", clubId)
          .eq("is_active", true)
          .single();

        if (!clubData) {
          router.push("/unauthorized");
          return;
        }

        setCurrentClub(clubData);

        // Check if user has access (super admin or has club_admin role for this club)
        const userHasAccess = isSuperAdmin || clubIds.includes(clubId);

        if (!userHasAccess) {
          router.push("/unauthorized");
          return;
        }

        setHasAccess(true);

        // Fetch available clubs for club selector
        let query = supabase
          .from("clubs")
          .select("id, name, slug, city, logo_url")
          .eq("is_active", true)
          .order("name");

        if (!isSuperAdmin) {
          query = query.in("id", clubIds);
        }

        const { data: clubsData } = await query;
        setAvailableClubs(clubsData || []);
      } catch (error) {
        console.error("Error validating access:", error);
        router.push("/unauthorized");
      } finally {
        setLoading(false);
      }
    }

    validateAccess();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, clubId]);

  const handleSignOut = async () => {
    await signOut();
    window.location.href = "/login";
  };

  const handleSwitchClub = (newClubId: string) => {
    router.push(`/club/${newClubId}`);
    setClubSelectorOpen(false);
  };

  if (loading || !hasAccess) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-green-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex transform flex-col border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-800 dark:bg-gray-900 lg:static lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
          {!sidebarCollapsed && (
            <Link href={`/club/${clubId}`} className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-600">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                Club Admin
              </span>
            </Link>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:block"
          >
            <Menu className="h-5 w-5" />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {/* Back to Admin button for super admins */}
          {isSuperAdmin && !sidebarCollapsed && (
            <Link
              href="/admin"
              className="mb-4 flex items-center gap-2 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ArrowLeft className="h-4 w-4 flex-shrink-0" />
              <span>Back to Admin</span>
            </Link>
          )}

          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        {!sidebarCollapsed && (
          <div className="border-t border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                {user?.email?.charAt(0).toUpperCase() || "C"}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {isSuperAdmin ? "Super Admin" : "Club Admin"}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              disabled={authLoading}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:px-8">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Club Selector (if multiple clubs) */}
          {availableClubs.length > 1 && (
            <div className="relative">
              <button
                onClick={() => setClubSelectorOpen(!clubSelectorOpen)}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
              >
                <Building2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="hidden sm:inline">{currentClub?.name || "Select Club"}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {clubSelectorOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setClubSelectorOpen(false)}
                  />
                  <div className="absolute left-0 z-20 mt-2 w-64 origin-top-left rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="p-2">
                      <p className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        SELECT CLUB
                      </p>
                      {availableClubs.map((club) => (
                        <button
                          key={club.id}
                          onClick={() => handleSwitchClub(club.id)}
                          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                            currentClub?.id === club.id
                              ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                              : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700"
                          }`}
                        >
                          <Building2 className="h-4 w-4 flex-shrink-0" />
                          <div className="flex-1 overflow-hidden">
                            <p className="truncate font-medium">{club.name}</p>
                            {club.city && (
                              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                {club.city}
                              </p>
                            )}
                          </div>
                          {currentClub?.id === club.id && (
                            <div className="h-2 w-2 rounded-full bg-green-600 dark:bg-green-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Search bar */}
          <div className="hidden flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800 lg:flex lg:max-w-md">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-500 outline-none dark:text-white dark:placeholder-gray-400"
            />
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            {mounted && (
              <button
                onClick={() => {
                  const newTheme = theme === "dark" ? "light" : "dark";
                  setTheme(newTheme);
                }}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </button>
            )}

            {/* Notifications */}
            <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {/* Settings */}
            <Link
              href={`/club/${clubId}/settings`}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <Settings className="h-5 w-5" />
            </Link>

            {/* User menu */}
            <div className="relative ml-2 hidden lg:block">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  {user?.email?.charAt(0).toUpperCase() || "C"}
                </div>
                <span className="hidden xl:block">{user?.email}</span>
                <ChevronDown className="h-4 w-4" />
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setUserMenuOpen(false)}
                  />
                  {/* Menu */}
                  <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                    <div className="p-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {isSuperAdmin ? "Super Admin" : "Club Admin"}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user?.email}
                      </p>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleSignOut}
                        disabled={authLoading}
                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Sign out (mobile) */}
            <button
              onClick={handleSignOut}
              disabled={authLoading}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function ClubLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clubId: string }>;
}) {
  const { clubId } = use(params);

  return (
    <ProtectedRoute requireMinimumRole="club_admin">
      <ClubLayoutInner clubId={clubId}>{children}</ClubLayoutInner>
    </ProtectedRoute>
  );
}
