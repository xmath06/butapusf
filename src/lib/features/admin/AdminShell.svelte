<script lang="ts">
  import { onMount, type Snippet } from "svelte";
  import { me, logout } from "../../api";
  import { setAdmin, admin } from "../../session";
  import { navigate, ROUTES, currentPath } from "../../router.svelte";
  import type { AdminUser } from "../../types";
  import Spinner from "../../components/Spinner.svelte";

  let {
    children,
  }: {
    children: Snippet;
  } = $props();

  let adminUser: AdminUser | null = $state(null);
  let booting = $state(true);

  onMount(async () => {
    try {
      const user = await me();
      setAdmin(user);
      adminUser = user;
    } catch {
      setAdmin(null);
      navigate(ROUTES.login);
    } finally {
      booting = false;
    }
  });

  async function onLogout() {
    try {
      await logout();
    } catch {
      // tetap lanjut logout lokal
    }
    setAdmin(null);
    navigate(ROUTES.login);
  }

  const menu = [
    { href: ROUTES.dashboard, label: "Buku Tamu" },
    { href: ROUTES.users, label: "Manajemen User", adminOnly: true },
    { href: ROUTES.settings, label: "Pengaturan" },
  ];

  function isActive(href: string): boolean {
    return $currentPath === href;
  }
</script>

{#if booting}
  <div class="flex min-h-screen items-center justify-center gap-2 text-slate-500">
    <Spinner size={24} />
    Memeriksa sesi...
  </div>
{:else}
  <div class="min-h-screen bg-slate-100">
    <header class="sticky top-0 z-10 border-b border-slate-200 bg-white">
      <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <div class="flex items-center gap-2">
          <span class="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-lg text-white">🏥</span>
          <div>
            <h1 class="text-sm font-bold text-slate-800">Buku Tamu Puskesmas</h1>
            <p class="text-xs text-slate-500">Dashboard Admin</p>
          </div>
        </div>

        <nav class="flex flex-1 flex-wrap items-center gap-1">
          {#each menu as item (item.href)}
            {#if !item.adminOnly || $admin?.role === "admin"}
              <button
                type="button"
                onclick={() => navigate(item.href)}
                class="rounded-lg px-3 py-1.5 text-sm font-medium transition {isActive(item.href)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50'}"
              >
                {item.label}
              </button>
            {/if}
          {/each}
        </nav>

        <div class="flex items-center gap-3">
          <span class="hidden text-sm text-slate-600 sm:inline">
            {adminUser?.email}
            {#if adminUser?.role === "admin"}
              <span class="ml-1 rounded bg-primary-100 px-1.5 py-0.5 text-xs font-medium text-primary-700">Admin</span>
            {:else}
              <span class="ml-1 rounded bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-600">Staff</span>
            {/if}
          </span>
          <button
            type="button"
            onclick={onLogout}
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            Keluar
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl space-y-6 px-4 py-6">
      {@render children()}
    </main>
  </div>
{/if}