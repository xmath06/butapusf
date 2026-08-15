# AGENTS.md — Frontend Buku Tamu Puskesmas

Dokumen ini melengkapi `../AGENTS.md` di root repository. Baca keduanya sebelum mengubah kode.

## Ringkasan

SPA Svelte untuk sistem buku tamu puskesmas, di-deploy ke **Cloudflare Pages**.
Mengonsumsi REST API backend (`../backend`, ElysiaJS) via `fetch` + `credentials: "include"`.

| Fitur | Route (hash) | Auth |
|-------|--------------|------|
| Check-in tamu (publik) | `#/` | Tanpa auth |
| Login admin | `#/login` | Tanpa auth |
| Dashboard admin | `#/dashboard` | Cookie `auth_token` |

## Perintah (jalankan dari `frontend/`)

| Perintah | Fungsi |
|----------|--------|
| `bun install` | Install dependency |
| `bun run dev` | Dev server Vite |
| `bun run build` | Build produksi ke `dist/` |
| `bun run check` | `svelte-check` — **WAJIB lolos sebelum selesai** |

> Catatan: skrip memakai `bun --bun` agar Vite & svelte-check berjalan di runtime Bun.
> Ini penting bila system Node di mesin terlalu lama (mis. Node 16) untuk Vite 7+.

## Struktur

```
frontend/
├── index.html
├── vite.config.ts          # plugin svelte + tailwindcss
├── svelte.config.js
├── .env.example            # VITE_API_URL
└── src/
    ├── main.ts             # mount App
    ├── App.svelte          # router hash (checkin / login / dashboard)
    ├── app.css             # Tailwind v4
    └── lib/
        ├── api.ts          # API client + ApiError
        ├── types.ts        # Tipe mengikuti docs/API.md
        ├── session.ts      # Svelte store sesi admin
        ├── router.svelte.ts # Router hash SPA
        ├── constants.ts    # Konstanta global frontend
        ├── format.ts       # format tanggal/waktu
        ├── components/     # Komponen UI bersama (Spinner, Alert)
        └── features/
            ├── checkin/CheckInPage.svelte
            ├── auth/LoginPage.svelte
            └── admin/
                ├── DashboardPage.svelte
                ├── stats/StatsCards.svelte
                └── guests/GuestsSection.svelte
```

## Aturan

- **Svelte 5** (runes `$state`/`$props`). Satu `.svelte` per komponen, satu folder per fitur.
- Styling: **Tailwind CSS v4** (import `@import "tailwindcss"` di `app.css`), warna brand `primary-*` dari `@theme`.
- API: selalu lewat `src/lib/api.ts`. Jangan `fetch` langsung di komponen.
- Auth: cookie HttpOnly otomatis dikirim (`credentials: "include"`). **Jangan** akses `document.cookie` / simpan token.
- Base URL: env `VITE_API_URL` (default dev `http://localhost:3000/api/v1`).
- Router: hash (`#/login`, `#/dashboard`) — aman untuk hosting statis, tidak butuh fallback server.
- Tipe data di `src/lib/types.ts` harus selaras dengan `docs/API.md`.
- `svelte.config.js` sengaja **tanpa** `vitePreprocess`: Svelte 5 memproses TS native, dan Tailwind ditangani plugin Vite.
- Bahasa UI & komentar: Bahasa Indonesia.
- Setelah mengubah kode: `bun run check` wajib lolos, lalu `bun run build` untuk verifikasi.

## Deploy ke Cloudflare Pages

- Build command: `bun install && bun run build`
- Output directory: `dist`
- Env var: `VITE_API_URL` = base URL API produksi backend (mis. `https://api.bukutamu.com/api/v1`)
- Hash routing tidak memerlukan konfigurasi SPA fallback.
