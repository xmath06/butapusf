/**
 * Cloudflare Pages Function — proxy /api/* ke backend SnapDeploy.
 *
 * Tujuannya membuat request API jadi SAME-ORIGIN dengan frontend
 * (https://<project>.pages.dev/api/...), sehingga cookie auth `auth_token`
 * menjadi first-party dan tidak diblokir browser (masalah third-party cookie
 * lintas domain Cloudflare <-> SnapDeploy).
 *
 * Semua header (termasuk Cookie & Set-Cookie) diteruskan apa adanya.
 *
 * Set environment variable di Cloudflare Pages:
 *   BACKEND_URL = https://<app-anda>.snapdeploy.app
 */
export async function onRequest(context: {
  request: Request;
  env: { BACKEND_URL?: string };
}): Promise<Response> {
  const { request, env } = context;
  const backendUrl = env.BACKEND_URL ?? "";
  if (!backendUrl) {
    return new Response(
      JSON.stringify({ success: false, message: "BACKEND_URL belum di-set di Cloudflare Pages" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const url = new URL(request.url);
  const target = `${backendUrl.replace(/\/+$/, "")}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  // Hapus host agar Cloudflare mengisi host backend saat fetch.
  headers.delete("host");
  // Header ini tidak relevan untuk upstream.
  headers.delete("cf-connecting-ip");
  headers.delete("cf-ray");

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  const upstream = await fetch(target, {
    method: request.method,
    headers,
    body: hasBody ? request.body : undefined,
    redirect: "manual",
  });

  // Teruskan respons (status, headers termasuk Set-Cookie, body) apa adanya.
  return upstream;
}