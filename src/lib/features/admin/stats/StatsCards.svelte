<script lang="ts">
  import type { DailyStats } from "../../../types";

  let { stats }: { stats: DailyStats | null } = $props();

  const cards = $derived([
    {
      label: "Total Tamu Hari Ini",
      value: stats?.totalToday ?? 0,
      icon: "👥",
      color: "bg-sky-50 text-sky-700 border-sky-200",
    },
    {
      label: "Sudah Checkout",
      value: stats?.checkedOut ?? 0,
      icon: "✅",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    {
      label: "Belum Checkout",
      value: stats?.notCheckedOut ?? 0,
      icon: "🕒",
      color: "bg-amber-50 text-amber-700 border-amber-200",
    },
  ]);
</script>

<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
  {#each cards as card (card.label)}
    <div class="rounded-xl border {card.color} p-4">
      <div class="flex items-center gap-3">
        <span class="text-2xl">{card.icon}</span>
        <div>
          <p class="text-xs font-medium opacity-80">{card.label}</p>
          <p class="text-2xl font-bold">{card.value}</p>
        </div>
      </div>
    </div>
  {/each}
</div>

{#if stats}
  <div class="mt-4 rounded-xl border border-slate-200 bg-white p-4">
    <h3 class="mb-3 text-sm font-semibold text-slate-700">Breakdown per Tujuan</h3>
    {#if stats.byPurpose.length === 0}
      <p class="text-sm text-slate-400">Belum ada data hari ini.</p>
    {:else}
      <ul class="space-y-2">
        {#each stats.byPurpose as item (item.purpose)}
          <li class="flex items-center justify-between text-sm">
            <span class="text-slate-600">{item.purpose}</span>
            <div class="flex items-center gap-3">
              <div class="h-2 w-32 overflow-hidden rounded-full bg-slate-100 sm:w-48">
                <div
                  class="h-full rounded-full bg-primary-500"
                  style="width: {stats.totalToday > 0 ? (item.count / stats.totalToday) * 100 : 0}%"
                ></div>
              </div>
              <span class="w-6 text-right font-semibold text-slate-800">{item.count}</span>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
{/if}
