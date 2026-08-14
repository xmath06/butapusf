/**
 * Router SPA berbasis hash (mis. #/login, #/dashboard).
 * Hash routing aman untuk hosting statis (Cloudflare Pages)
 * karena tidak butuh konfigurasi fallback server.
 */
import { writable } from "svelte/store";

export const ROUTES = {
  checkin: "/",
  login: "/login",
  dashboard: "/dashboard",
  users: "/users",
  settings: "/settings",
} as const;

function currentHash(): string {
  const hash = window.location.hash.replace(/^#/, "");
  return hash === "" ? ROUTES.checkin : hash;
}

export const currentPath = writable<string>(currentHash());

export function navigate(path: string): void {
  window.location.hash = path;
}

if (typeof window !== "undefined") {
  window.addEventListener("hashchange", () => {
    currentPath.set(currentHash());
  });
}
