"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Edit,
  Mail,
  Phone,
  Award,
  Calendar,
  Users,
  Briefcase,
} from "lucide-react";

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
        <Link href={`/club/${clubId}/coaches`}>
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Coaches
          </Button>
        </Link>
        <Link href={`/club/${clubId}/coaches/${coach.id}/edit`}>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Coach
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="rounded-lg border bg-card p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
              {coach.users?.avatar_url ? (
                <img
                  src={coach.users.avatar_url}
                  alt={coach.users?.full_name || "Coach"}
                  className="h-32 w-32 rounded-full object-cover mb-4"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <span className="text-4xl font-medium">
                    {coach.users?.full_name
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "?"}
                  </span>
                </div>
              )}
              <h2 className="text-2xl font-bold">
                {coach.users?.full_name || "Unknown"}
              </h2>
              {coach.specialization && (
                <p className="text-muted-foreground mt-1">
                  {coach.specialization}
                </p>
              )}
              <div className="mt-4">
                {coach.is_active ? (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  >
                    Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
                  >
                    Inactive
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-3 pt-6 border-t">
              {coach.email && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{coach.email}</span>
                </div>
              )}
              {coach.users?.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{coach.users.phone}</span>
                </div>
              )}
              {coach.license_type && (
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <span className="text-sm font-medium">
                      {coach.license_type}
                    </span>
                    {coach.license_number && (
                      <p className="text-xs text-muted-foreground">
                        #{coach.license_number}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {coach.years_of_experience !== null && (
                <div className="flex items-center gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {coach.years_of_experience}{" "}
                    {coach.years_of_experience === 1 ? "year" : "years"} of
                    experience
                  </span>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  Joined {new Date(coach.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          {coach.bio && (
            <div className="rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Biography</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {coach.bio}
              </p>
            </div>
          )}

          {/* Team Assignments */}
          <div className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Team Assignments</h3>
              </div>
              <Link href={`/club/${clubId}/coaches/${coach.id}/assign-teams`}>
                <Button variant="outline" size="sm">
                  Manage Teams
                </Button>
              </Link>
            </div>

            {teamAssignments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No team assignments yet
                </p>
                <Link href={`/club/${clubId}/coaches/${coach.id}/assign-teams`}>
                  <Button variant="outline" size="sm" className="mt-4">
                    Assign to Teams
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {teamAssignments.map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <Link
                        href={`/club/${clubId}/teams/${assignment.teams?.id}`}
                        className="font-medium hover:underline"
                      >
                        {assignment.teams?.name || "Unknown Team"}
                      </Link>
                      {assignment.teams?.age_group && (
                        <p className="text-sm text-muted-foreground">
                          {assignment.teams.age_group}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className={getRoleBadgeColor(assignment.role)}
                      >
                        {formatRoleName(assignment.role)}
                      </Badge>
                      <p className="text-sm text-muted-foreground">
                        Since {new Date(assignment.assigned_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
