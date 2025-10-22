"use client";

import Link from "next/link";

type Club = {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
};

export default function ClubsTable({ clubs }: { clubs: Club[] }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Clubs
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage all football clubs in the system
          </p>
        </div>
        <Link
          href="/admin/clubs/new"
          className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
        >
          Add Club
        </Link>
      </div>

      {/* Clubs Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                City
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {clubs.length > 0 ? (
              clubs.map((club) => (
                <tr key={club.id} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link href={`/club/${club.id}`} className="block">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {club.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {club.slug}
                      </div>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">
                    <Link href={`/club/${club.id}`} className="block">
                      {club.city}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link href={`/club/${club.id}`} className="block">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {club.contact_email}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {club.contact_phone}
                      </div>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link href={`/club/${club.id}`} className="block">
                      <span
                        className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                          club.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }`}
                      >
                        {club.is_active ? "Active" : "Inactive"}
                      </span>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <Link
                      href={`/admin/clubs/${club.id}`}
                      className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Edit
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
                  No clubs found. Click &quot;Add Club&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
