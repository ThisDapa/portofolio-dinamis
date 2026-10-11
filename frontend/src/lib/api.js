export const apiUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}
export async function api(path, options = {}) {
  const base =
    typeof window === "undefined" ? (process.env.API_URL ?? apiUrl) : apiUrl;
  const response = await fetch(`${base}/api${path}`, {
    ...options,
    cache: "no-store",
    credentials: "include",
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
  });
  if (!response.ok) {
    const body = await response.json().catch((error) => ({
      error:
        error instanceof Error
          ? "Server tidak merespons."
          : "Permintaan gagal.",
    }));
    throw new ApiError(body.error ?? "Permintaan gagal.", response.status);
  }
  if (response.status === 204) return undefined;
  return response.json();
}
export function imageSource(path) {
  return path.startsWith("/uploads/") ? `${apiUrl}${path}` : path;
}
