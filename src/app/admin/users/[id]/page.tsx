"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type UserRole = {
  id: string;
  role: string;
  club_id: string | null;
  club_name: string | null;
};

type Club = {
  id: string;
  name: string;
};

type UserData = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  roles: UserRole[];
};

const ROLE_OPTIONS = ["super_admin", "club_admin", "coach", "parent", "player"] as const;

export default function UserManagePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [showAddRole, setShowAddRole] = useState(false);
  const [newRole, setNewRole] = useState<string>("club_admin");
  const [selectedClub, setSelectedClub] = useState<string>("");

  useEffect(() => {
    fetchUserData();
    fetchClubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function fetchUserData() {
    try {
      // Fetch user data from API
      const response = await fetch(`/api/admin/users/${params.id}`);

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const data = await response.json();

      const roles: UserRole[] = (data.roles || []).map((r: {
        id: string;
        role: string;
        club_id: string | null;
        clubs: { name: string } | null;
      }) => ({
        id: r.id,
        role: r.role,
        club_id: r.club_id,
        club_name: r.clubs ? r.clubs.name : null,
      }));

      setUserData({
        id: data.id,
        email: data.email || "",
        full_name: data.full_name || null,
        created_at: data.created_at,
        roles,
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClubs() {
    const { data, error } = await supabase
      .from("clubs")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

    if (!error && data) {
      setClubs(data);
    }
  }

  async function handleAddRole() {
    if (!newRole) {
      setError("Please select a role");
      return;
    }

    // Check if role requires club
    const requiresClub = ["club_admin", "coach"].includes(newRole);
    if (requiresClub && !selectedClub) {
      setError("Please select a club for this role");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: params.id,
        role: newRole as "super_admin" | "club_admin" | "coach" | "parent" | "player",
        club_id: requiresClub ? selectedClub : null,
      });

      if (error) throw error;

      setSuccess("Role added successfully");
      setShowAddRole(false);
      setNewRole("club_admin");
      setSelectedClub("");
      fetchUserData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleRemoveRole(roleId: string) {
    if (!confirm("Are you sure you want to remove this role?")) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const { error } = await supabase.from("user_roles").delete().eq("id", roleId);

      if (error) throw error;

      setSuccess("Role removed successfully");
      fetchUserData();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function formatRoleName(role: string) {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  function getRoleBadgeColor(role: string) {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
      case "club_admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "coach":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "parent":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "player":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading user data...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">User not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Manage User
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            View and manage user roles and permissions
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/admin/users")}
          className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
        >
          Back to Users
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-400">{success}</p>
        </div>
      )}

      {/* User Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          User Information
        </h3>
        <dl className="mt-4 space-y-3">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {userData.full_name || "No name"}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{userData.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</dt>
            <dd className="mt-1 text-sm font-mono text-gray-900 dark:text-white">
              {userData.id}
            </dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Joined
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">
              {new Date(userData.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </div>

      {/* Roles Management */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Roles</h3>
          <button
            type="button"
            onClick={() => setShowAddRole(!showAddRole)}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            {showAddRole ? "Cancel" : "Add Role"}
          </button>
        </div>

        {/* Add Role Form */}
        {showAddRole && (
          <div className="mt-4 space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-600 dark:bg-gray-900">
            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Role
              </label>
              <select
                id="role"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {formatRoleName(role)}
                  </option>
                ))}
              </select>
            </div>

            {["club_admin", "coach"].includes(newRole) && (
              <div>
                <label
                  htmlFor="club"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Club *
                </label>
                <select
                  id="club"
                  value={selectedClub}
                  onChange={(e) => setSelectedClub(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a club</option>
                  {clubs.map((club) => (
                    <option key={club.id} value={club.id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddRole}
              disabled={saving}
              className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
            >
              {saving ? "Adding..." : "Add Role"}
            </button>
          </div>
        )}

        {/* Current Roles */}
        <div className="mt-4 space-y-2">
          {userData.roles.length > 0 ? (
            userData.roles.map((roleData) => (
              <div
                key={roleData.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-600 dark:bg-gray-800"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getRoleBadgeColor(roleData.role)}`}
                  >
                    {formatRoleName(roleData.role)}
                  </span>
                  {roleData.club_name && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      at {roleData.club_name}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveRole(roleData.id)}
                  disabled={saving}
                  className="text-sm text-red-600 hover:text-red-900 disabled:opacity-50 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">No roles assigned</p>
          )}
        </div>
      </div>
    </div>
  );
}
