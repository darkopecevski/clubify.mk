"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";

type Team = {
  id: string;
  name: string;
  age_group: string | null;
  is_active: boolean;
};

type Assignment = {
  id: string;
  team_id: string;
  role: string;
  assigned_at: string;
  is_active: boolean;
};

type Coach = {
  id: string;
  name: string;
};

const COACH_ROLES = [
  { value: "head_coach", label: "Head Coach" },
  { value: "assistant_coach", label: "Assistant Coach" },
  { value: "goalkeeper_coach", label: "Goalkeeper Coach" },
  { value: "fitness_coach", label: "Fitness Coach" },
  { value: "other", label: "Other" },
];

export default function AssignTeamsClient({
  clubId,
  coach,
  teams,
  currentAssignments,
}: {
  clubId: string;
  coach: Coach;
  teams: Team[];
  currentAssignments: Assignment[];
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [error, setError] = useState("");

  // Get teams that are not currently assigned
  const assignedTeamIds = currentAssignments.map((a) => a.team_id);
  const availableTeams = teams.filter((t) => !assignedTeamIds.includes(t.id));

  // Get team details for current assignments
  const assignmentsWithTeams = currentAssignments.map((assignment) => {
    const team = teams.find((t) => t.id === assignment.team_id);
    return {
      ...assignment,
      team_name: team?.name || "Unknown Team",
      team_age_group: team?.age_group || null,
    };
  });

  const handleAddAssignment = async () => {
    if (!selectedTeam || !selectedRole) {
      setError("Please select both team and role");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/club/coaches/${coach.id}/teams`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: selectedTeam,
          role: selectedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to assign coach to team");
      }

      // Reset form and close modal
      setSelectedTeam("");
      setSelectedRole("");
      setShowAddModal(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign coach");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm("Are you sure you want to remove this coach from the team?")) {
      return;
    }

    try {
      const res = await fetch(`/api/club/team-coaches/${assignmentId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to remove assignment");
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove assignment");
    }
  };

  const formatRoleName = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "head_coach":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100";
      case "assistant_coach":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100";
      case "goalkeeper_coach":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100";
      case "fitness_coach":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/club/${clubId}/coaches/${coach.id}`}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Assign Teams to {coach.name}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage team assignments and coaching roles
          </p>
        </div>
      </div>

      {/* Current Assignments */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Current Team Assignments
          </h2>
          {availableTeams.length > 0 && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
            >
              <Plus className="h-4 w-4" />
              Assign to Team
            </button>
          )}
        </div>

        {assignmentsWithTeams.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              This coach is not assigned to any teams yet
            </p>
            {availableTeams.length > 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <Plus className="h-4 w-4" />
                Assign to Team
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {assignmentsWithTeams.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between rounded-md border border-gray-200 p-4 dark:border-gray-700"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {assignment.team_name}
                  </div>
                  {assignment.team_age_group && (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {assignment.team_age_group}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRoleBadgeColor(
                      assignment.role
                    )}`}
                  >
                    {formatRoleName(assignment.role)}
                  </span>
                  <button
                    onClick={() => handleRemoveAssignment(assignment.id)}
                    className="rounded p-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
              Assign to Team
            </h3>

            {error && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="team"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Select Team *
                </label>
                <select
                  id="team"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-green-400"
                >
                  <option value="">Choose a team</option>
                  {availableTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name} {team.age_group ? `(${team.age_group})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Coaching Role *
                </label>
                <select
                  id="role"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-green-400"
                >
                  <option value="">Choose a role</option>
                  {COACH_ROLES.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedTeam("");
                  setSelectedRole("");
                  setError("");
                }}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAssignment}
                disabled={isSubmitting}
                className="flex-1 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
              >
                {isSubmitting ? "Assigning..." : "Assign"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
