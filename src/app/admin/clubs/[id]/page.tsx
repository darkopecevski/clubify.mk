"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clubSchema, type ClubInput } from "@/lib/validations/club";
import { createClient } from "@/lib/supabase/client";
import { UserPlus, Trash2 } from "lucide-react";

type ClubAdmin = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
};

export default function EditClubPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  // Club admins state
  const [admins, setAdmins] = useState<ClubAdmin[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(true);
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [adminFormData, setAdminFormData] = useState({ email: "", fullName: "" });
  const [adminFormError, setAdminFormError] = useState("");
  const [adminFormLoading, setAdminFormLoading] = useState(false);
  const [createdAdmin, setCreatedAdmin] = useState<{ email: string; password: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClubInput>({
    resolver: zodResolver(clubSchema),
  });

  const watchName = watch("name");

  // Fetch club data
  useEffect(() => {
    async function fetchClub() {
      const { data: club, error } = await supabase
        .from("clubs")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        setError("Failed to load club data");
        setFetchLoading(false);
        return;
      }

      if (club) {
        setValue("name", club.name || "");
        setValue("slug", club.slug || "");
        setValue("city", club.city || "");
        setValue("founded_year", club.founded_year ?? undefined);
        setValue("contact_email", club.contact_email || "");
        setValue("contact_phone", club.contact_phone || "");
        setValue("website", club.website || "");
        setValue("address", club.address || "");
        setValue("description", club.description || "");
        setValue("logo_url", club.logo_url || "");
        setValue("is_active", club.is_active ?? true);
      }

      setFetchLoading(false);
    }

    fetchClub();
  }, [params.id, supabase, setValue]);

  // Fetch club admins
  useEffect(() => {
    async function fetchAdmins() {
      setAdminsLoading(true);
      try {
        const response = await fetch(`/api/admin/clubs/${params.id}/admins`);
        if (response.ok) {
          const data = await response.json();
          setAdmins(data.admins || []);
        }
      } catch (err) {
        console.error("Error fetching admins:", err);
      } finally {
        setAdminsLoading(false);
      }
    }

    fetchAdmins();
  }, [params.id]);

  const generateSlug = () => {
    if (watchName) {
      const slug = watchName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setValue("slug", slug);
    }
  };

  const onSubmit = async (data: ClubInput) => {
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase
        .from("clubs")
        .update({
          name: data.name,
          slug: data.slug,
          city: data.city,
          founded_year: data.founded_year || null,
          contact_email: data.contact_email,
          contact_phone: data.contact_phone || null,
          website: data.website || null,
          address: data.address || null,
          description: data.description || null,
          logo_url: data.logo_url || null,
          is_active: data.is_active,
        })
        .eq("id", params.id);

      if (error) throw error;

      router.push("/admin/clubs");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.from("clubs").delete().eq("id", params.id);

      if (error) throw error;

      router.push("/admin/clubs");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminFormLoading(true);
    setAdminFormError("");

    try {
      const response = await fetch(`/api/admin/clubs/${params.id}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create admin");
      }

      // Show success with password
      setCreatedAdmin({
        email: data.user.email,
        password: data.user.default_password,
      });

      // Refresh admins list
      const adminsResponse = await fetch(`/api/admin/clubs/${params.id}/admins`);
      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json();
        setAdmins(adminsData.admins || []);
      }

      // Reset form
      setAdminFormData({ email: "", fullName: "" });
      setShowAdminForm(false);
    } catch (err) {
      setAdminFormError((err as Error).message);
    } finally {
      setAdminFormLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600 dark:text-gray-400">Loading club data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Club</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Update club information
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="space-y-6">
            {/* Club Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Club Name *
              </label>
              <input
                type="text"
                id="name"
                {...register("name")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Slug *
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  id="slug"
                  {...register("slug")}
                  className="block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                >
                  Generate
                </button>
              </div>
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.slug.message}
                </p>
              )}
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                City *
              </label>
              <input
                type="text"
                id="city"
                {...register("city")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              />
              {errors.city && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.city.message}
                </p>
              )}
            </div>

            {/* Founded Year */}
            <div>
              <label
                htmlFor="founded_year"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Founded Year
              </label>
              <input
                type="number"
                id="founded_year"
                {...register("founded_year", { valueAsNumber: true })}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              />
              {errors.founded_year && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.founded_year.message}
                </p>
              )}
            </div>

            {/* Contact Email */}
            <div>
              <label
                htmlFor="contact_email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Contact Email *
              </label>
              <input
                type="email"
                id="contact_email"
                {...register("contact_email")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              />
              {errors.contact_email && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.contact_email.message}
                </p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label
                htmlFor="contact_phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Contact Phone
              </label>
              <input
                type="tel"
                id="contact_phone"
                {...register("contact_phone")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              />
              {errors.contact_phone && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.contact_phone.message}
                </p>
              )}
            </div>

            {/* Website */}
            <div>
              <label
                htmlFor="website"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Website
              </label>
              <input
                type="url"
                id="website"
                {...register("website")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.website.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Address
              </label>
              <input
                type="text"
                id="address"
                {...register("address")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              />
              {errors.address && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                {...register("description")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Logo URL */}
            <div>
              <label
                htmlFor="logo_url"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Logo URL
              </label>
              <input
                type="url"
                id="logo_url"
                {...register("logo_url")}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                placeholder="https://example.com/logo.png"
              />
              {errors.logo_url && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.logo_url.message}
                </p>
              )}
            </div>

            {/* Is Active */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                {...register("is_active")}
                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700"
              />
              <label
                htmlFor="is_active"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Active
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setDeleteConfirm(true)}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          >
            Delete Club
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/clubs")}
              className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>

      {/* Club Admins Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Club Administrators
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Manage users who can administer this club
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAdminForm(true)}
            className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
          >
            <UserPlus className="h-4 w-4" />
            Add Admin
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {adminsLoading ? (
            <div className="p-6 text-center text-gray-600 dark:text-gray-400">
              Loading admins...
            </div>
          ) : admins.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                No administrators assigned to this club yet.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {admins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-4"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {admin.full_name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {admin.email}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title="Remove admin"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Confirm Delete
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this club? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm(false)}
                disabled={loading}
                className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAdminForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Add Club Administrator
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Create a new user account for this club administrator
            </p>

            {adminFormError && (
              <div className="mt-4 rounded-md bg-red-50 p-3 dark:bg-red-900/20">
                <p className="text-sm text-red-800 dark:text-red-400">
                  {adminFormError}
                </p>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Full Name *
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={adminFormData.fullName}
                  onChange={(e) =>
                    setAdminFormData({ ...adminFormData, fullName: e.target.value })
                  }
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  value={adminFormData.email}
                  onChange={(e) =>
                    setAdminFormData({ ...adminFormData, email: e.target.value })
                  }
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500"
                  placeholder="admin@example.com"
                />
              </div>

              <div className="rounded-md bg-blue-50 p-3 dark:bg-blue-900/20">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  A default password will be generated. You&apos;ll see it after creation.
                </p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdminForm(false);
                    setAdminFormError("");
                  }}
                  disabled={adminFormLoading}
                  className="rounded-md bg-gray-600 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adminFormLoading}
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50"
                >
                  {adminFormLoading ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Modal - Show Password */}
      {createdAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
            <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
              Admin Created Successfully!
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Save these credentials. The password won&apos;t be shown again.
            </p>

            <div className="mt-4 space-y-3 rounded-md bg-gray-50 p-4 dark:bg-gray-900">
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Email
                </p>
                <p className="mt-1 font-mono text-sm text-gray-900 dark:text-white">
                  {createdAdmin.email}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Temporary Password
                </p>
                <p className="mt-1 font-mono text-sm text-gray-900 dark:text-white">
                  {createdAdmin.password}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-md bg-yellow-50 p-3 dark:bg-yellow-900/20">
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                The user should change this password after their first login.
              </p>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setCreatedAdmin(null)}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
