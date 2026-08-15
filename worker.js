/**
 * Cloudflare Worker untuk Buku Tamu Puskesmas.
 *
 * - Melayani SPA statis (build "dist") lewat Cloudflare Assets.
 * - Mem-proxy semua request "/api/*" ke backend SnapDeploy (BACKEND_URL),
 *   termasuk POST/PUT/PATCH/DELETE/OPTIONS, sehingga cookie auth
 *   "auth_token" menjadi first-party (same-origin dengan frontend).
 *
 * Deploy: "npx wrangler deploy"  (lihat wrangler.toml)
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      const backendUrl = (env.BACKEND_URL ?? "").replace(/\/+$/, "");
      if (!backendUrl) {
        return new Response(
          JSON.stringify({ success: false, message: "BACKEND_URL belum di-set di Cloudflare" }),
          { status: 500, headers: { "Content-Type": "application/json" } }
        );
      }

      const target = `${backendUrl}${url.pathname}${url.search}`;
      const headers = new Headers(request.headers);
      headers.delete("host");
      headers.delete("cf-connecting-ip");
      headers.delete("cf-ray");

      const hasBody = request.method !== "GET" && request.method !== "HEAD";

      return fetch(target, {
        method: request.method,
        headers,
        body: hasBody ? request.body : undefined,
        redirect: "manual",
      });
    }

    // Selain /api, serahkan ke Cloudflare Assets (SPA).
    return env.ASSETS.fetch(request);
  },
};
