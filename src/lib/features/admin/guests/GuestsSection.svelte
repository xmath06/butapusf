<script lang="ts">
  import { onMount } from "svelte";
  import { getGuests, checkoutGuest, deleteGuest, exportGuestsExcel } from "../../../api";
  import type { Guest } from "../../../types";
  import { formatTime, formatDate } from "../../../format";
  import Spinner from "../../../components/Spinner.svelte";
  import Alert from "../../../components/Alert.svelte";

  let search = $state("");
  let purposeFilter = $state("");
  let dateFilter = $state("");
  let page = $state(1);
  const limit = 20;

  let items: Guest[] = $state([]);
  let total = $state(0);
  let totalPages = $state(0);
  let loading = $state(false);
  let errorMessage = $state("");
  let checkoutLoadingId: string | null = $state(null);
  let deleteLoadingId: string | null = $state(null);
  let exporting = $state(false);

  async function loadGuests() {
    loading = true;
    errorMessage = "";
    try {
      const result = await getGuests({
        search: search.trim() || undefined,
        purpose: purposeFilter || undefined,
        date: dateFilter || undefined,
        page,
        limit,
      });
      items = result.items;
      total = result.total;
      totalPages = result.totalPages;
    } catch (e) {
      errorMessage = e instanceof Error ? e.message : "Gagal memuat data tamu";
    } finally {
      loading = false;
    }
  }

  function onSearchSubmit() {
    page = 1;
    loadGuests();
  }

  function resetFilters() {
    search = "";
    purposeFilter = "";
    dateFilter = "";
    page = 1;
    loadGuests();
  }

  function changePage(next: number) {
    if (next < 1 || next > totalPages) return;
    page = next;
    loadGuests();
  }

  async function onCheckout(guest: Guest) {
    if (guest.checked_out_at) return;
    if (!window.confirm(`Checkout "${guest.full_name}" sekarang?`)) return;
    checkoutLoadingId = guest.id;
    try {
      await checkoutGuest(guest.id);
      await loadGuests();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal checkout");
    } finally {
      checkoutLoadingId = null;
    }
  }

  async function onDelete(guest: Guest) {
    if (!window.confirm(`Hapus data "${guest.full_name}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    deleteLoadingId = guest.id;
    try {
      await deleteGuest(guest.id);
      await loadGuests();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal menghapus data");
    } finally {
      deleteLoadingId = null;
    }
  }

  /** Export SEMUA baris hasil filter aktif (tanpa pagination) ke Excel. */
  async function onExport() {
    exporting = true;
    try {
      await exportGuestsExcel({
        search: search.trim() || undefined,
        purpose: purposeFilter || undefined,
        date: dateFilter || undefined,
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Gagal mengekspor data");
    } finally {
      exporting = false;
    }
  }

  onMount(() => {
    loadGuests();
  });
</script>

<div class="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
  <div class="mb-4 flex flex-wrap items-end gap-3">
    <form class="flex flex-1 flex-wrap items-end gap-3" onsubmit={(e) => { e.preventDefault(); onSearchSubmit(); }}>
      <div class="min-w-40 flex-1">
        <label for="search" class="mb-1 block text-xs font-medium text-slate-600">Cari nama / NIK / telepon</label>
        <input
          id="search"
          bind:value={search}
          type="search"
          placeholder="Ketik lalu tekan Enter..."
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      </div>
      <div class="min-w-40">
        <label for="purpose-filter" class="mb-1 block text-xs font-medium text-slate-600">Tujuan</label>
        <input
          id="purpose-filter"
          bind:value={purposeFilter}
          onchange={() => { page = 1; loadGuests(); }}
          type="text"
          placeholder="Filter tujuan"
          class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      </div>
      <div>
        <label for="date-filter" class="mb-1 block text-xs font-medium text-slate-600">Tanggal</label>
        <input
          id="date-filter"
          bind:value={dateFilter}
          type="date"
          onchange={() => { page = 1; loadGuests(); }}
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
        />
      </div>
      <button type="submit" class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700">
        Cari
      </button>
      <button type="button" onclick={resetFilters} class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
        Reset
      </button>
      <button
        type="button"
        onclick={onExport}
        disabled={exporting}
        class="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {#if exporting}
          <Spinner size={14} />
          Mengekspor...
        {:else}
          Export Excel
        {/if}
      </button>
    </form>
  </div>

  <Alert message={errorMessage} />

  {#if loading}
    <div class="flex items-center justify-center gap-2 py-12 text-slate-500">
      <Spinner size={20} />
      Memuat data...
    </div>
  {:else if items.length === 0}
    <p class="py-12 text-center text-sm text-slate-400">Tidak ada data tamu.</p>
  {:else}
    <div class="overflow-x-auto">
      <table class="w-full min-w-175 text-left text-sm">
        <thead>
          <tr class="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th class="px-3 py-2">Nama</th>
            <th class="px-3 py-2">NIK / HP</th>
            <th class="px-3 py-2">Email</th>
            <th class="px-3 py-2">Alamat / Institusi</th>
            <th class="px-3 py-2">Tujuan</th>
            <th class="px-3 py-2">Pesan</th>
            <th class="px-3 py-2">Masuk</th>
            <th class="px-3 py-2">Keluar</th>
            <th class="px-3 py-2">Status</th>
            <th class="px-3 py-2 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#each items as guest (guest.id)}
            <tr class="align-top transition hover:bg-slate-50">
              <td class="px-3 py-3 font-medium text-slate-800">{guest.full_name}</td>
              <td class="px-3 py-3 text-slate-500">{guest.nik_or_phone ?? "-"}</td>
              <td class="px-3 py-3 text-slate-500">{guest.email ?? "-"}</td>
              <td class="px-3 py-3 text-slate-500">{guest.address_or_institution}</td>
              <td class="px-3 py-3">
                <span class="inline-block rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700">
                  {guest.purpose}
                </span>
              </td>
              <td class="max-w-48 px-3 py-3 text-slate-500">
                {guest.pesan ?? "-"}
              </td>
              <td class="px-3 py-3 whitespace-nowrap text-slate-600">
                {formatDate(guest.checked_in_at)}<br /><span class="text-xs text-slate-400">{formatTime(guest.checked_in_at)}</span>
              </td>
              <td class="px-3 py-3 whitespace-nowrap text-slate-600">
                {guest.checked_out_at ? formatTime(guest.checked_out_at) : "-"}
              </td>
              <td class="px-3 py-3">
                {#if guest.checked_out_at}
                  <span class="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">Selesai</span>
                {:else}
                  <span class="inline-block rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">Aktif</span>
                {/if}
              </td>
              <td class="px-3 py-3">
                <div class="flex items-center justify-end gap-2">
                  {#if guest.checked_out_at}
                    <span class="text-xs text-slate-300">-</span>
                  {:else}
                    <button
                      type="button"
                      onclick={() => onCheckout(guest)}
                      disabled={checkoutLoadingId === guest.id || deleteLoadingId === guest.id}
                      class="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {#if checkoutLoadingId === guest.id}
                        <Spinner size={12} />
                      {/if}
                      Checkout
                    </button>
                  {/if}
                  <button
                    type="button"
                    onclick={() => onDelete(guest)}
                    disabled={deleteLoadingId === guest.id || checkoutLoadingId === guest.id}
                    class="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {#if deleteLoadingId === guest.id}
                      <Spinner size={12} />
                    {/if}
                    Hapus
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <div class="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 text-sm text-slate-600">
      <span>Menampilkan <strong>{items.length}</strong> dari <strong>{total}</strong> tamu</span>
      <div class="flex items-center gap-2">
        <button
          type="button"
          onclick={() => changePage(page - 1)}
          disabled={page <= 1}
          class="rounded-lg border border-slate-300 px-3 py-1.5 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Sebelumnya
        </button>
        <span class="px-1 text-xs text-slate-500">Halaman {page} / {totalPages || 1}</span>
        <button
          type="button"
          onclick={() => changePage(page + 1)}
          disabled={page >= totalPages}
          class="rounded-lg border border-slate-300 px-3 py-1.5 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Berikutnya →
        </button>
      </div>
    </div>
  {/if}
</div>
