<script lang="ts">
  import { healthCheck, wakeServer } from "./api";
  import ServerLoading from "./components/ServerLoading.svelte";

  let { children }: { children: import("svelte").Snippet } = $props();

  // Polling tetap tiap detik (seperti browser yang menghit berkali-kali sampai
  // dapat 200). Jeda panjang justru membuat container SnapDeploy keburu tidur
  // lagi di antara pengecekan, sehingga cold start tidak pernah selesai.
  const POLL_INTERVAL = 1;

  let ready = $state(false);
  let checking = $state(false);
  let warming = $state(false);
  let nextCheckIn = $state<number | null>(null);

  async function checkServer() {
    checking = true;
    try {
      // Poll HEAD ke /api/v1/health sampai dapat 200.
      const status = await healthCheck();
      if (status === "up") {
        ready = true;
        return;
      }
      warming = status === "warming";
    } finally {
      checking = false;
    }
    nextCheckIn = POLL_INTERVAL;
    setTimeout(checkServer, POLL_INTERVAL * 1000);
  }

  // Bangunkan container SnapDeploy cukup SEKALI (POST ke endpoint wake),
  // lalu mulai poll HEAD kesiapan.
  wakeServer();
  checkServer();
</script>

{#if ready}
  {@render children()}
{:else}
  <ServerLoading {nextCheckIn} {checking} {warming} />
{/if}
