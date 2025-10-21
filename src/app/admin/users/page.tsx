import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = "force-dynamic";

type UserWithRoles = {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  roles: Array<{
    role: string;
    club_id: string | null;
    club_name: string | null;
  }>;
  children?: Array<{
    player_id: string;
    player_name: string;
    relationship: string;
  }>;
};

async function getUsers() {
  const adminClient = createAdminClient();

  // Get all users with emails using our custom function
  const { data: usersData, error: usersError } = await adminClient.rpc("get_users_with_email");

  if (usersError) {
    console.error("Error fetching users:", usersError);
    return [];
  }

  // Get all user roles with club names in one query
  const { data: userRoles, error: rolesError } = await adminClient
    .from("user_roles")
    .select(`
      user_id,
      role,
      club_id,
      clubs (
        name
      )
    `);

  if (rolesError) {
    console.error("Error fetching user roles:", rolesError);
  }

  // Get parent-player relationships
  const { data: parentRelations, error: parentsError } = await adminClient
    .from("player_parents")
    .select(`
      parent_user_id,
      relationship,
      players (
        id,
        first_name,
        last_name
      )
    `);

  if (parentsError) {
    console.error("Error fetching parent relations:", parentsError);
  }

  // Combine users with their roles and children
  const users: UserWithRoles[] = (usersData || []).map((user) => {
    const roles = (userRoles || [])
      .filter((r) => r.user_id === user.id)
      .map((r) => ({
        role: r.role,
        club_id: r.club_id,
        club_name: r.clubs ? (r.clubs as { name: string }).name : null,
      }));

    // Get children for this user
    const children = (parentRelations || [])
      .filter((pr) => pr.parent_user_id === user.id)
      .map((pr) => {
        const player = pr.players as { id: string; first_name: string; last_name: string } | null;
        return {
          player_id: player?.id || "",
          player_name: player ? `${player.first_name} ${player.last_name}` : "Unknown",
          relationship: pr.relationship,
        };
      });

    return {
      id: user.id,
      email: user.email || "",
      full_name: user.full_name || null,
      created_at: user.created_at,
      roles,
      children: children.length > 0 ? children : undefined,
    };
  });

  return users;
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

function formatRoleName(role: string) {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage all users and their roles in the system
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Roles
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Joined
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {user.full_name || "No name"}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {user.id.slice(0, 8)}...
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((roleData, idx) => (
                            <span
                              key={idx}
                              className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${getRoleBadgeColor(roleData.role)}`}
                            >
                              {formatRoleName(roleData.role)}
                              {roleData.club_name && (
                                <span className="ml-1 text-[10px] opacity-75">
                                  ({roleData.club_name})
                                </span>
                              )}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            No roles
                          </span>
                        )}
                      </div>
                      {user.children && user.children.length > 0 && (
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          <div className="font-medium">Children:</div>
                          {user.children.map((child, idx) => (
                            <div key={idx} className="ml-2">
                              • {child.player_name} ({child.relationship})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
