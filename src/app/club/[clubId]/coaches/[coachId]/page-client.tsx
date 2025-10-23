"use client";

import Link from "next/link";
import { Users } from "lucide-react";

type Coach = {
  id: string;
  club_id: string;
  user_id: string;
  license_type: string | null;
  license_number: string | null;
  specialization: string | null;
  years_of_experience: number | null;
  bio: string | null;
  photo_url: string | null;
  is_active: boolean;
  created_at: string;
  users: {
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
  } | null;
  email: string;
};

type TeamAssignment = {
  id: string;
  role: string;
  assigned_at: string;
  is_active: boolean;
  teams: {
    id: string;
    name: string;
    age_group: string | null;
  } | null;
};

export default function CoachProfileClient({
  clubId,
  coach,
  teamAssignments,
}: {
  clubId: string;
  coach: Coach;
  teamAssignments: TeamAssignment[];
}) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {coach.users?.full_name || "Unknown Coach"}
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Coach Profile
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/club/${clubId}/coaches/${coach.id}/edit`}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Edit Coach
          </Link>
          <Link
            href={`/club/${clubId}/coaches`}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Back to Coaches
          </Link>
        </div>
      </div>

      {/* Status Badge */}
      <div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
            coach.is_active
              ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
              : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
          }`}
        >
          {coach.is_active ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contact Information */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Contact Information
          </h2>
          <dl className="space-y-3">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Full Name</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {coach.users?.full_name || "Unknown"}
              </dd>
            </div>
            {coach.email && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {coach.email}
                </dd>
              </div>
            )}
            {coach.users?.phone && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {coach.users.phone}
                </dd>
              </div>
            )}
            {coach.specialization && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Specialization</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {coach.specialization}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Coaching Credentials */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Coaching Credentials
          </h2>
          <dl className="space-y-3">
            {coach.license_type ? (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">License Type</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {coach.license_type}
                </dd>
              </div>
            ) : (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">License Type</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">Not specified</dd>
              </div>
            )}
            {coach.license_number && (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">License Number</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {coach.license_number}
                </dd>
              </div>
            )}
            {coach.years_of_experience !== null ? (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Years of Experience</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                  {coach.years_of_experience} {coach.years_of_experience === 1 ? "year" : "years"}
                </dd>
              </div>
            ) : (
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Years of Experience</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">Not specified</dd>
              </div>
            )}
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Joined</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                {new Date(coach.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Bio */}
      {coach.bio && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Biography</h2>
          <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
            {coach.bio}
          </p>
        </div>
      )}

      {/* Team Assignments */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Team Assignments
          </h2>
          <Link
            href={`/club/${clubId}/coaches/${coach.id}/assign-teams`}
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-green-700"
          >
            <Users className="h-4 w-4" />
            Manage Teams
          </Link>
        </div>

        {teamAssignments.length === 0 ? (
          <div className="py-12 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-sm font-medium text-gray-900 dark:text-white">
              No team assignments yet
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by assigning this coach to teams
            </p>
            <Link
              href={`/club/${clubId}/coaches/${coach.id}/assign-teams`}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              <Users className="h-4 w-4" />
              Assign to Teams
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {teamAssignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between rounded-md border border-gray-200 p-3 dark:border-gray-700"
              >
                <div className="flex-1">
                  <Link
                    href={`/club/${clubId}/teams/${assignment.teams?.id}`}
                    className="text-sm font-medium text-green-600 hover:text-green-700 dark:text-green-400"
                  >
                    {assignment.teams?.name || "Unknown Team"}
                  </Link>
                  {assignment.teams?.age_group && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {assignment.teams.age_group}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getRoleBadgeColor(assignment.role)}`}
                  >
                    {formatRoleName(assignment.role)}
                  </span>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Since {new Date(assignment.assigned_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
