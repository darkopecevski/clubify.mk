import Link from "next/link";

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Authentication Error
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sorry, we couldn&apos;t authenticate you. This could be because:
          </p>
          <ul className="mt-4 space-y-2 text-left text-sm text-gray-600 dark:text-gray-400">
            <li>• The link has expired</li>
            <li>• The link has already been used</li>
            <li>• There was a technical issue</li>
          </ul>
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
