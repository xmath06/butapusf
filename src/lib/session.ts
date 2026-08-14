import type { AdminUser } from "./types";
import { writable } from "svelte/store";

/** Sesi admin yang sedang login (null = belum login). */
export const admin = writable<AdminUser | null>(null);
export const authLoading = writable<boolean>(true);

export function setAdmin(user: AdminUser | null): void {
  admin.set(user);
  authLoading.set(false);
}
