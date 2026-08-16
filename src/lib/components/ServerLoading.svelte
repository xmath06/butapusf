<script lang="ts">
  let {
    nextCheckIn,
    checking,
    warming,
  }: { nextCheckIn: number | null; checking: boolean; warming: boolean } = $props();
</script>

<div
  class="flex min-h-screen flex-col items-center justify-center gap-6 bg-slate-50 px-6 text-center"
>
  <div class="relative h-20 w-20">
    <div class="absolute inset-0 animate-ping rounded-full bg-primary-500/30"></div>
    <div class="absolute inset-0 flex items-center justify-center">
      <div
        class="h-14 w-14 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"
      ></div>
    </div>
  </div>

  <div class="space-y-1">
    <h1 class="text-lg font-semibold text-slate-700">
      {warming ? "Server sedang bangun…" : "Menyiapkan server…"}
    </h1>
    <p class="text-sm text-slate-500">
      {warming
        ? "Backend terdeteksi merespons, menunggu cold start selesai."
        : "Server sedang diaktifkan. Mohon tunggu sebentar."}
    </p>
  </div>

  {#if checking}
    <p class="text-xs text-primary-600">Memeriksa koneksi server…</p>
  {:else if nextCheckIn !== null}
    <p class="text-xs text-slate-400">
      Pengecekan berikutnya dalam {nextCheckIn} detik
    </p>
  {/if}
</div>
