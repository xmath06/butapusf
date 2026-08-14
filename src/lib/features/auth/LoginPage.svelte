<script lang="ts">
  import { login, me } from "../../api";
  import { setAdmin } from "../../session";
  import { navigate, ROUTES } from "../../router.svelte";
  import Spinner from "../../components/Spinner.svelte";
  import Alert from "../../components/Alert.svelte";

  let email = $state("");
  let password = $state("");
  let loading = $state(false);
  let errorMessage = $state("");

  async function onSubmit() {
    errorMessage = "";
    if (!email.trim()) {
      errorMessage = "Email wajib diisi";
      return;
    }
    if (password.length < 6) {
      errorMessage = "Password minimal 6 karakter";
      return;
    }
    loading = true;
    try {
      await login(email.trim(), password);
      const user = await me();
      setAdmin(user);
      navigate(ROUTES.dashboard);
    } catch (e) {
      errorMessage = e instanceof Error ? e.message : "Login gagal, coba lagi";
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Login Admin - Buku Tamu Puskesmas</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-slate-100 px-4">
  <div class="w-full max-w-sm">
    <header class="mb-6 text-center">
      <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-2xl text-white shadow">
        🔐
      </div>
      <h1 class="text-xl font-bold text-slate-800">Login Admin</h1>
      <p class="mt-1 text-sm text-slate-500">Masuk ke dashboard buku tamu</p>
    </header>

    <form
      class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      onsubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div class="space-y-4">
        <div>
          <label for="email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            id="email"
            bind:value={email}
            type="email"
            autocomplete="email"
            placeholder="admin@puskesmas.id"
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            required
          />
        </div>
        <div>
          <label for="password" class="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            id="password"
            bind:value={password}
            type="password"
            autocomplete="current-password"
            class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            required
          />
        </div>
      </div>

      <div class="mt-5">
        <Alert message={errorMessage} />
      </div>

      <button
        type="submit"
        disabled={loading}
        class="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {#if loading}
          <Spinner size={16} />
          Memproses...
        {:else}
          Masuk
        {/if}
      </button>

      <a href="#/" class="mt-4 block text-center text-xs text-slate-400 hover:text-slate-600">
        Kembali ke halaman check-in
      </a>
    </form>
  </div>
</div>
