import { apiFetch, ApiError } from "./api";

export type Role = "SALON" | "FREELANCE" | "ADMIN";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hr_token");
}

export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hr_role") as Role | null;
}

export function clearSession() {
  localStorage.removeItem("hr_token");
  localStorage.removeItem("hr_role");
}

/** Wrapper authentifié : ajoute le token, redirige vers /connexion sur 401. */
export async function authFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  try {
    return await apiFetch<T>(path, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      clearSession();
      window.location.href = "/connexion";
    }
    throw err;
  }
}
