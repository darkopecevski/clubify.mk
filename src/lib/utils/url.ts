/**
 * Get the base URL for the application
 * Works in all environments: local, preview, production
 */
export function getURL() {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this to your site URL in production
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel
    process?.env?.NEXT_PUBLIC_APP_URL ?? // Fallback to APP_URL from .env.local
    "http://localhost:3000/";

  // Make sure to include `https://` when not localhost
  url = url.startsWith("http") ? url : `https://${url}`;
  // Make sure to include trailing `/`
  url = url.endsWith("/") ? url : `${url}/`;

  return url;
}

/**
 * Get the full callback URL for auth redirects
 */
export function getAuthCallbackURL(path: string = "/auth/callback") {
  return `${getURL()}${path.startsWith("/") ? path.slice(1) : path}`;
}
