"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { useClubContext } from "@/hooks/use-club-context";
import { ArrowLeft, Loader2, Trash2 } from "lucide-react";

const teamSchema = z.object({
  name: z.string().min(2, "Team name must be at least 2 characters"),
  age_group: z.string().min(1, "Age group is required"),
  season: z.string().optional(),
  is_active: z.boolean(),
});

type TeamFormData = z.infer<typeof teamSchema>;

type Team = {
  id: string;
  name: string;
  age_group: string;
  season: string | null;
  is_active: boolean;
  club_id: string;
};

export default function EditTeamPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { selectedClubId } = useClubContext();
  const [loading, setLoading] = useState(false);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<Team | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
  });

  useEffect(() => {
    if (selectedClubId) {
      fetchTeam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClubId, id]);

  async function fetchTeam() {
    if (!selectedClubId) return;

    setLoadingTeam(true);
    const supabase = createClient();

    try {
      const { data, error: fetchError } = await supabase
        .from("teams")
        .select("*")
        .eq("id", id)
        .eq("club_id", selectedClubId)
        .single();

      if (fetchError) throw fetchError;

      setTeam(data);
      reset({
        name: data.name,
        age_group: data.age_group,
        season: data.season || "",
        is_active: data.is_active,
      });
    } catch (err) {
      console.error("Error fetching team:", err);
      setError("Failed to load team");
    } finally {
      setLoadingTeam(false);
    }
  }

  const onSubmit = async (data: TeamFormData) => {
    if (!selectedClubId) {
      setError("No club selected");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase
        .from("teams")
        .update({
          name: data.name,
          age_group: data.age_group,
          season: data.season || null,
          is_active: data.is_active,
        })
        .eq("id", id)
        .eq("club_id", selectedClubId);

      if (updateError) throw updateError;

      router.push("/club/teams");
    } catch (err) {
      console.error("Error updating team:", err);
      setError((err as Error).message || "Failed to update team");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClubId) return;

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Check if team has players
      const { data: players } = await supabase
        .from("team_players")
        .select("id")
        .eq("team_id", id)
        .limit(1);

      if (players && players.length > 0) {
        setError("Cannot delete team with assigned players. Please remove all players first.");
        setDeleteConfirm(false);
        setLoading(false);
        return;
      }

      const { error: deleteError } = await supabase
        .from("teams")
        .delete()
        .eq("id", id)
        .eq("club_id", selectedClubId);

      if (deleteError) throw deleteError;

      router.push("/club/teams");
    } catch (err) {
      console.error("Error deleting team:", err);
      setError((err as Error).message || "Failed to delete team");
      setDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  if (loadingTeam) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">Team not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/club/teams"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Team
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Update team information
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-6 p-6">
            {/* Team Name & Age Group */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Team Name *
                </label>
                <input
                  {...register("name")}
                  type="text"
                  id="name"
                  placeholder="e.g., U10 Eagles"
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-400"
                />
                {errors.name && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="age_group"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Age Group *
                </label>
                <select
                  {...register("age_group")}
                  id="age_group"
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-green-400"
                >
                  <option value="">Select age group</option>
                  <option value="U6">U6 (Under 6)</option>
                  <option value="U7">U7 (Under 7)</option>
                  <option value="U8">U8 (Under 8)</option>
                  <option value="U9">U9 (Under 9)</option>
                  <option value="U10">U10 (Under 10)</option>
                  <option value="U11">U11 (Under 11)</option>
                  <option value="U12">U12 (Under 12)</option>
                  <option value="U13">U13 (Under 13)</option>
                  <option value="U14">U14 (Under 14)</option>
                  <option value="U15">U15 (Under 15)</option>
                  <option value="U16">U16 (Under 16)</option>
                  <option value="U17">U17 (Under 17)</option>
                  <option value="U18">U18 (Under 18)</option>
                  <option value="U19">U19 (Under 19)</option>
                  <option value="Senior">Senior</option>
                  <option value="Veterans">Veterans</option>
                </select>
                {errors.age_group && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {errors.age_group.message}
                  </p>
                )}
              </div>
            </div>

            {/* Season */}
            <div>
              <label
                htmlFor="season"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Season
              </label>
              <input
                {...register("season")}
                type="text"
                id="season"
                placeholder="e.g., 2024/2025"
                className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-400"
              />
              <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                Optional: Specify the season for this team
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3">
              <input
                {...register("is_active")}
                type="checkbox"
                id="is_active"
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900"
              />
              <label
                htmlFor="is_active"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Team is active
              </label>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
            <button
              type="button"
              onClick={() => setDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-red-800 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <Trash2 className="h-4 w-4" />
              Delete Team
            </button>
            <div className="flex gap-3">
              <Link
                href="/club/teams"
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Delete Team
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this team? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                disabled={loading}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
