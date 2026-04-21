import { cookies } from "next/headers";

const SESSION_COOKIE_NAMES = [
  "devit-dashboard.session-token",
  "__Secure-devit-dashboard.session-token",
] as const;

/**
 * Extracts the raw HS256 JWT from the dashboard session cookie.
 * Since we override jwt.encode to produce a plain HS256 token,
 * the cookie value IS the Bearer token — no conversion needed.
 */
export async function getBackendBearerToken(): Promise<string | null> {
  const cookieStore = await cookies();

  for (const name of SESSION_COOKIE_NAMES) {
    const token = cookieStore.get(name)?.value;
    if (token) return token;
  }

  return null;
}

/**
 * Convenience fetch wrapper for backend API calls from dashboard server code.
 * Usage: await backendFetch("/api/domains")
 */
export async function backendFetch(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const token = await getBackendBearerToken();

  if (!token) {
    throw new Error("No session token — user is not authenticated");
  }

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) throw new Error("BACKEND_URL is not set");

  return fetch(`${backendUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}