import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import tailwindcss from "@tailwindcss/vite";

// Proxy dev: browser -> vite(:5173)/api -> backend lokal(:3000).
// Di production, proxy ditangani Cloudflare Pages Function (functions/api/[[path]].ts).
export default defineConfig({
  plugins: [svelte(), tailwindcss()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});