"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type Coach = {
  id: string;
  club_id: string;
  user_id: string;
  license_type: string | null;
  license_number: string | null;
  specialization: string | null;
  years_of_experience: number | null;
  bio: string | null;
  users: {
    full_name: string;
    phone: string | null;
  } | null;
  email: string;
};

type FormData = {
  full_name: string;
  phone: string;
  license_type: string;
  license_number: string;
  specialization: string;
  years_of_experience: string;
  bio: string;
};

export default function EditCoachForm({
  clubId,
  coach,
}: {
  clubId: string;
  coach: Coach;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    full_name: coach.users?.full_name || "",
    phone: coach.users?.phone || "",
    license_type: coach.license_type || "",
    license_number: coach.license_number || "",
    specialization: coach.specialization || "",
    years_of_experience: coach.years_of_experience?.toString() || "",
    bio: coach.bio || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = "Full name is required";
    }

    if (
      formData.years_of_experience &&
      (isNaN(Number(formData.years_of_experience)) ||
        Number(formData.years_of_experience) < 0)
    ) {
      newErrors.years_of_experience =
        "Years of experience must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/club/coaches/${coach.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone || null,
          license_type: formData.license_type || null,
          license_number: formData.license_number || null,
          specialization: formData.specialization || null,
          years_of_experience: formData.years_of_experience
            ? parseInt(formData.years_of_experience)
            : null,
          bio: formData.bio || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update coach");
      }

      router.push(`/club/${clubId}/coaches/${coach.id}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating coach:", error);
      setErrors({
        submit:
          error instanceof Error ? error.message : "Failed to update coach",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            Edit Coach
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Update coach information and credentials
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-900/20">
          <p className="text-sm text-red-800 dark:text-red-400">{errors.submit}</p>
        </div>
      )}

      {/* Form */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="space-y-6 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h2>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-900 dark:text-white">Email:</span>
              <span className="text-gray-600 dark:text-gray-400">{coach.email}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Email cannot be changed
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Full Name *
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
                className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-400"
              />
              {errors.full_name && (
                <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                  {errors.full_name}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone
              </label>
              <input
                id="phone"
                name="phone"
                type="text"
                value={formData.phone}
                onChange={handleChange}
                placeholder="070123456"
                className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-400"
              />
            </div>

            <div>
              <label
                htmlFor="specialization"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Specialization
              </label>
              <input
                id="specialization"
                name="specialization"
                type="text"
                value={formData.specialization}
                onChange={handleChange}
                placeholder="e.g., Youth Development, Tactics"
                className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-400"
              />
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Coaching Credentials</h2>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="license_type"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  License Type
                </label>
                <select
                  id="license_type"
                  name="license_type"
                  value={formData.license_type}
                  onChange={(e) => handleSelectChange("license_type", e.target.value)}
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:focus:border-green-400"
                >
                  <option value="">Select license type</option>
                  <option value="UEFA Pro">UEFA Pro</option>
                  <option value="UEFA A">UEFA A</option>
                  <option value="UEFA B">UEFA B</option>
                  <option value="UEFA C">UEFA C</option>
                  <option value="Grassroots">Grassroots</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="license_number"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  License Number
                </label>
                <input
                  id="license_number"
                  name="license_number"
                  type="text"
                  value={formData.license_number}
                  onChange={handleChange}
                  placeholder="e.g., UEFA-A-12345"
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-400"
                />
              </div>

              <div>
                <label
                  htmlFor="years_of_experience"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Years of Experience
                </label>
                <input
                  id="years_of_experience"
                  name="years_of_experience"
                  type="number"
                  min="0"
                  value={formData.years_of_experience}
                  onChange={handleChange}
                  placeholder="5"
                  className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-400"
                />
                {errors.years_of_experience && (
                  <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">
                    {errors.years_of_experience}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label
                htmlFor="bio"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Brief biography and coaching philosophy..."
                rows={4}
                className="mt-1.5 block w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-green-400"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 dark:bg-green-500 dark:hover:bg-green-600"
          >
            {isSubmitting ? "Updating..." : "Update Coach"}
          </button>
        </div>
      </div>
    </form>
  );
}
