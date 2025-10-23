"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Mail, Phone, Award, Users, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type Coach = {
  id: string;
  user_id: string;
  license_type: string | null;
  license_number: string | null;
  specialization: string | null;
  years_of_experience: number | null;
  bio: string | null;
  photo_url: string | null;
  is_active: boolean;
  users: {
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
  } | null;
  email: string;
  teams: Array<{
    id: string;
    coach_id: string;
    role: string;
    teams: {
      id: string;
      name: string;
    } | null;
  }>;
};

export default function CoachesPageClient({
  clubId,
  coaches,
}: {
  clubId: string;
  coaches: Coach[];
}) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleDelete = async (coachId: string) => {
    if (!confirm("Are you sure you want to deactivate this coach?")) {
      return;
    }

    setIsDeleting(coachId);
    try {
      const res = await fetch(`/api/club/coaches/${coachId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete coach");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error deleting coach:", error);
      alert(
        error instanceof Error ? error.message : "Failed to delete coach"
      );
    } finally {
      setIsDeleting(null);
    }
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

  const formatRoleName = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Coaches</h1>
          <p className="text-muted-foreground mt-1">
            Manage your coaching staff
          </p>
        </div>
        <Link href={`/club/${clubId}/coaches/create`}>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Coach
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">
              Total Coaches
            </h3>
          </div>
          <p className="text-3xl font-bold mt-2">{coaches.length}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">
              Licensed
            </h3>
          </div>
          <p className="text-3xl font-bold mt-2">
            {coaches.filter((c) => c.license_type).length}
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">
              Active
            </h3>
          </div>
          <p className="text-3xl font-bold mt-2">
            {coaches.filter((c) => c.is_active).length}
          </p>
        </div>
      </div>

      {/* Coaches Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>License</TableHead>
              <TableHead>Experience</TableHead>
              <TableHead>Teams</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coaches.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-12 w-12 text-muted-foreground" />
                    <p className="text-muted-foreground">No coaches yet</p>
                    <Link href={`/club/${clubId}/coaches/create`}>
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Coach
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              coaches.map((coach) => (
                <TableRow key={coach.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {coach.users?.avatar_url ? (
                        <img
                          src={coach.users.avatar_url}
                          alt={coach.users?.full_name || "Coach"}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium">
                            {coach.users?.full_name
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                      <div>
                        <Link
                          href={`/club/${clubId}/coaches/${coach.id}`}
                          className="font-medium hover:underline"
                        >
                          {coach.users?.full_name || "Unknown"}
                        </Link>
                        {coach.specialization && (
                          <p className="text-sm text-muted-foreground">
                            {coach.specialization}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-sm">
                      {coach.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          <span>{coach.email}</span>
                        </div>
                      )}
                      {coach.users?.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{coach.users.phone}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {coach.license_type ? (
                      <div className="flex flex-col gap-1">
                        <span className="font-medium">{coach.license_type}</span>
                        {coach.license_number && (
                          <span className="text-xs text-muted-foreground">
                            #{coach.license_number}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {coach.years_of_experience !== null ? (
                      <span>
                        {coach.years_of_experience}{" "}
                        {coach.years_of_experience === 1 ? "year" : "years"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {coach.teams.length > 0 ? (
                        coach.teams.map((ta) => (
                          <Badge
                            key={ta.id}
                            variant="outline"
                            className={getRoleBadgeColor(ta.role)}
                          >
                            {ta.teams?.name} ({formatRoleName(ta.role)})
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No teams
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {coach.is_active ? (
                      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/club/${clubId}/coaches/${coach.id}/edit`}>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(coach.id)}
                        disabled={isDeleting === coach.id}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
