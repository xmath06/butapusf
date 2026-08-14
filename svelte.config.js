/**
 * Konfigurasi Svelte.
 * Catatan: tanpa `vitePreprocess` karena:
 * - Svelte 5 sudah menangani TypeScript pada tag <script lang="ts"> secara native.
 * - Tailwind CSS diproses oleh plugin @tailwindcss/vite pada tahap build,
 *   bukan pada preprocess Svelte.
 * Ini juga menghindari svelte-check memuat Vite di bawah runtime Bun.
 */
export default {};