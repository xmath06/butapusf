/**
 * Tipe data yang mengikuti shape respons backend
 * (lihat docs/API.md di root repository).
 */

export interface SuccessResponse<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  details?: unknown;
}

export interface Guest {
  id: string;
  full_name: string;
  nik_or_phone: string | null;
  email: string | null;
  address_or_institution: string;
  purpose: string;
  pesan: string | null;
  checked_in_at: string;
  checked_out_at: string | null;
  created_at: string;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type AdminRole = "admin" | "staff";

export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
}

export interface User {
  id: string;
  email: string;
  role: AdminRole;
  created_at: string;
}

export interface CreateUserPayload {
  email: string;
  password: string;
  role: AdminRole;
}

export interface CheckInPayload {
  full_name: string;
  nik_or_phone?: string;
  email?: string;
  address_or_institution: string;
  purpose: string;
  pesan?: string;
  checked_in_at?: string;
}

export interface CheckInResult {
  id: string;
  full_name: string;
  email: string | null;
  purpose: string;
  checked_in_at: string;
}

export interface GuestListParams {
  search?: string;
  purpose?: string;
  date?: string;
  page?: number;
  limit?: number;
}

export interface DailyStats {
  date: string;
  totalToday: number;
  notCheckedOut: number;
  checkedOut: number;
  byPurpose: { purpose: string; count: number }[];
}

export interface CheckoutResult {
  id: string;
  full_name: string;
  checked_out_at: string | null;
}
