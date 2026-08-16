<script lang="ts">
  import { healthCheck } from "./api";
  import ServerLoading from "./components/ServerLoading.svelte";

  let { children }: { children: import("svelte").Snippet } = $props();

  // Interval mengecil untuk kasus server BENAR-BENAR tak terjangkau (down):
  // 30s → 15s → 8s → 4s → 2s → 1s.
  const INTERVALS = [30, 15, 8, 4, 2, 1];
  // Bila server merespons tapi belum siap (warming / 503), cek ulang cepat
  // agar container tidak keburu tidur lagi sebelum cold start selesai.
  const WARMING_INTERVAL = 3;

  let ready = $state(false);
  let checking = $state(false);
  let warming = $state(false);
  let nextCheckIn = $state<number | null>(null);
  let attempt = $state(0);

  function intervalFor(i: number): number {
    return i < INTERVALS.length ? INTERVALS[i] : 1;
  }

  async function checkServer() {
    checking = true;
    try {
      const status = await healthCheck();
      if (status === "up") {
        ready = true;
        return;
      }
      if (status === "warming") {
        // Server merespons (mis. 503) → sedang bangun. Hit cepat.
        warming = true;
        nextCheckIn = WARMING_INTERVAL;
        setTimeout(checkServer, WARMING_INTERVAL * 1000);
        return;
      }
    } finally {
      checking = false;
    }
    // down: server tak terjangkau → interval mengecil.
    warming = false;
    const wait = intervalFor(attempt);
    attempt += 1;
    nextCheckIn = wait;
    setTimeout(checkServer, wait * 1000);
  }

  checkServer();
</script>

{#if ready}
  {@render children()}
{:else}
  <ServerLoading {nextCheckIn} {checking} {warming} />
{/if}
