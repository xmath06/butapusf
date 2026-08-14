<script lang="ts">
  import { onMount } from "svelte";
  import { getDailyStats } from "../../api";
  import type { DailyStats } from "../../types";
  import AdminShell from "./AdminShell.svelte";
  import StatsCards from "./stats/StatsCards.svelte";
  import GuestsSection from "./guests/GuestsSection.svelte";

  let stats: DailyStats | null = $state(null);

  onMount(async () => {
    try {
      stats = await getDailyStats();
    } catch {
      stats = null;
    }
  });
</script>

<svelte:head>
  <title>Buku Tamu - Dashboard Admin</title>
</svelte:head>

<AdminShell>
  <section>
    <h2 class="mb-3 text-base font-semibold text-slate-700">Statistik Hari Ini</h2>
    {#if stats}
      <StatsCards {stats} />
    {:else}
      <p class="text-sm text-slate-400">Belum ada statistik untuk dimuat.</p>
    {/if}
  </section>

  <section>
    <h2 class="mb-3 text-base font-semibold text-slate-700">Daftar Tamu</h2>
    <GuestsSection />
  </section>
</AdminShell>