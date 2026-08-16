<script lang="ts">
  import { healthCheck } from "./api";
  import ServerLoading from "./components/ServerLoading.svelte";

  let { children }: { children: import("svelte").Snippet } = $props();

  // Skema interval pengecekan yang semakin mengecil: 30s → 15s → 8s → 4s → 2s → 1s.
  const INTERVALS = [30, 15, 8, 4, 2, 1];

  let ready = $state(false);
  let checking = $state(false);
  let nextCheckIn = $state<number | null>(null);
  let attempt = $state(0);

  function intervalFor(i: number): number {
    return i < INTERVALS.length ? INTERVALS[i] : 1;
  }

  async function checkServer() {
    checking = true;
    try {
      if (await healthCheck()) {
        ready = true;
        return;
      }
    } finally {
      checking = false;
    }
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
  <ServerLoading {nextCheckIn} {checking} />
{/if}
