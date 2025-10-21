"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clubSchema, type ClubInput } from "@/lib/validations/club";
import { createClient } from "@/lib/supabase/client";

export default function NewClubPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ClubInput>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      is_active: true,
    },
  });

  // Auto-generate slug from name
  const watchName = watch("name");
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
    setError(null);

    try {
      const supabase = createClient();

      const { error: insertError } = await supabase.from("clubs").insert({
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
      });

      if (insertError) {
        throw insertError;
      }

      router.push("/admin/clubs");
      router.refresh();
    } catch (err) {
      setError((err as Error).message || "Failed to create club");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Add New Club
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Create a new football club in the system
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="p-6 space-y-6">
            {/* Name & Slug */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Club Name *
                </label>
                <input
                  {...register("name")}
                  type="text"
                  id="name"
                  onBlur={generateSlug}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 sm:text-sm"
                  placeholder="FK Akademija Skopje"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Slug *
                </label>
                <input
                  {...register("slug")}
                  type="text"
                  id="slug"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 sm:text-sm"
                  placeholder="fk-akademija-skopje"
                />
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.slug.message}
                  </p>
                )}
              </div>
            </div>

            {/* City & Founded Year */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  City *
                </label>
                <input
                  {...register("city")}
                  type="text"
                  id="city"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 sm:text-sm"
                  placeholder="Skopje"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="founded_year"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Founded Year
                </label>
                <input
                  {...register("founded_year", {
                    setValueAs: (v) => (v === "" ? null : parseInt(v)),
                  })}
                  type="number"
                  id="founded_year"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 sm:text-sm"
                  placeholder="2010"
                />
                {errors.founded_year && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.founded_year.message}
                  </p>
                )}
              </div>
            </div>

            {/* Contact Email & Phone */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="contact_email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Contact Email *
                </label>
                <input
                  {...register("contact_email")}
                  type="email"
                  id="contact_email"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 sm:text-sm"
                  placeholder="info@akademija.mk"
                />
                {errors.contact_email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.contact_email.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact_phone"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Contact Phone
                </label>
                <input
                  {...register("contact_phone")}
                  type="tel"
                  id="contact_phone"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 sm:text-sm"
                  placeholder="+389 70 123 456"
                />
                {errors.contact_phone && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.contact_phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Website & Logo URL */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Website
                </label>
                <input
                  {...register("website")}
                  type="url"
                  id="website"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 sm:text-sm"
                  placeholder="https://akademija.mk"
                />
                {errors.website && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.website.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="logo_url"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Logo URL
                </label>
                <input
                  {...register("logo_url")}
                  type="url"
                  id="logo_url"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 sm:text-sm"
                  placeholder="https://example.com/logo.png"
                />
                {errors.logo_url && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.logo_url.message}
                  </p>
                )}
              </div>
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
                {...register("address")}
                type="text"
                id="address"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 sm:text-sm"
                placeholder="ul. Sportska 1, Skopje"
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
                {...register("description")}
                id="description"
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-green-500 focus:outline-none focus:ring-green-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-500 sm:text-sm"
                placeholder="Brief description of the club..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                {...register("is_active")}
                type="checkbox"
                id="is_active"
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

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
            <Link
              href="/admin/clubs"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Club"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
