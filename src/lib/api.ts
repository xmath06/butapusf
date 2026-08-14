import type {
  AdminUser,
  CheckInPayload,
  CheckInResult,
  CheckoutResult,
  CreateUserPayload,
  DailyStats,
  Guest,
  GuestListParams,
  Paginated,
  SuccessResponse,
  User,
} from "./types";

const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1").replace(/\/+$/, "");

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Wrapper `fetch` untuk semua request API.
 * - `credentials: "include"` wajib: auth memakai HttpOnly cookie (JWT),
 *   sehingga token TIDAK boleh diakses/di-manage dari JavaScript.
 * - Mengubah respons error backend menjadi `ApiError`.
 */
async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body) headers.set("Content-Type", "application/json");

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers,
  });

  const body = (await res.json().catch(() => null)) as
    | SuccessResponse<T>
    | { success: false; message: string; details?: unknown }
    | null;

  if (!res.ok) {
    const message =
      body && "message" in body && typeof body.message === "string"
        ? body.message
        : "Terjadi kesalahan, coba lagi nanti";
    const details = body && "details" in body ? body.details : undefined;
    throw new ApiError(res.status, message, details);
  }

  return (body as SuccessResponse<T>).data;
}

// ---------- Guest (publik) ----------

export function checkIn(payload: CheckInPayload): Promise<CheckInResult> {
  return apiFetch("/guests/check-in", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// ---------- Auth ----------

export function login(email: string, password: string): Promise<{ message: string }> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout(): Promise<{ message: string }> {
  return apiFetch("/auth/logout", { method: "POST" });
}

export function me(): Promise<AdminUser> {
  return apiFetch("/auth/me");
}

export function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ message: string }> {
  return apiFetch("/auth/change-password", {
    method: "PATCH",
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

// ---------- Admin: tamu ----------

export function getGuests(params: GuestListParams = {}): Promise<Paginated<Guest>> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.purpose) qs.set("purpose", params.purpose);
  if (params.date) qs.set("date", params.date);
  qs.set("page", String(params.page ?? 1));
  qs.set("limit", String(params.limit ?? 20));

  const query = qs.toString();
  return apiFetch(`/admin/guests${query ? `?${query}` : ""}`);
}

export function checkoutGuest(id: string): Promise<CheckoutResult> {
  return apiFetch(`/admin/guests/${encodeURIComponent(id)}/checkout`, {
    method: "PATCH",
  });
}

export function deleteGuest(id: string): Promise<{ id: string; full_name: string }> {
  return apiFetch(`/admin/guests/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ---------- Admin: statistik ----------

export function getDailyStats(): Promise<DailyStats> {
  return apiFetch("/admin/stats/daily");
}

// ---------- Admin: manajemen user ----------

export function getUsers(): Promise<User[]> {
  return apiFetch("/admin/users");
}

export function createUser(payload: CreateUserPayload): Promise<User> {
  return apiFetch("/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteUser(id: string): Promise<{ id: string; email: string }> {
  return apiFetch(`/admin/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// ---------- Admin: export Excel ----------

/**
 * Unduh .xlsx dari backend. Filter (search/purpose/date) ikut dikirim;
 * backend mengekspor SEMUA baris hasil filter (tanpa pagination).
 */
export async function exportGuestsExcel(params: GuestListParams = {}): Promise<void> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.purpose) qs.set("purpose", params.purpose);
  if (params.date) qs.set("date", params.date);
  const query = qs.toString();

  const res = await fetch(`${BASE_URL}/admin/guests/export${query ? `?${query}` : ""}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null;
    throw new ApiError(res.status, body?.message ?? "Gagal mengekspor data");
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `buku-tamu-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
