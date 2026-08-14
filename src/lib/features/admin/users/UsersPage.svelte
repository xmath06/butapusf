<script lang="ts">
  import { getUsers, createUser, deleteUser } from "../../../api";
  import { admin } from "../../../session";
  import { navigate, ROUTES } from "../../../router.svelte";
  import type { AdminRole, User } from "../../../types";
  import AdminShell from "../AdminShell.svelte";
  import Alert from "../../../components/Alert.svelte";
  import Spinner from "../../../components/Spinner.svelte";

  let users: User[] = $state([]);
  let loading = $state(true);
  let errorMessage = $state("");
  let successMessage = $state("");

  let email = $state("");
  let password = $state("");
  let role = $state<AdminRole>("staff");
  let submitting = $state(false);
  let deleteLoadingId: string | null = $state(null);

  async function loadUsers() {
    loading = true;
    errorMessage = "";
    try {
      users = await getUsers();
    } catch (e) {
      errorMessage = e instanceof Error ? e.message : "Gagal memuat data user";
    } finally {
      loading = false;
    }
  }

  function resetForm() {
    email = "";
    password = "";
    role = "staff";
  }

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = "";
    successMessage = "";
    if (password.length < 8) {
      errorMessage = "Password minimal 8 karakter";
      return;
    }
    submitting = true;
    try {
      const created = await createUser({ email, password, role });
      successMessage = `${created.email} berhasil ditambahkan (${created.role})`;
      resetForm();
      await loadUsers();
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "Gagal menambahkan user";
    } finally {
      submitting = false;
    }
  }

  async function onDelete(u: User) {
    if (!window.confirm(`Hapus user "${u.email}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    deleteLoadingId = u.id;
    errorMessage = "";
    successMessage = "";
    try {
      const deleted = await deleteUser(u.id);
      successMessage = `${deleted.email} berhasil dihapus`;
      await loadUsers();
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "Gagal menghapus user";
    } finally {
      deleteLoadingId = null;
    }
  }

  $effect(() => {
    const a = $admin;
    if (!a) return;
    if (a.role !== "admin") {
      navigate(ROUTES.dashboard);
      return;
    }
    loadUsers();
  });
</script>

<svelte:head>
  <title>Manajemen User - Buku Tamu Puskesmas</title>
</svelte:head>

<AdminShell>
  <section>
    <h2 class="mb-3 text-base font-semibold text-slate-700">Tambah User</h2>
    <div class="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
      <form onsubmit={onSubmit} class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label for="user-email" class="mb-1 block text-xs font-medium text-slate-600">Email</label>
          <input
            id="user-email"
            bind:value={email}
            type="email"
            required
            placeholder="user@puskesmas.id"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label for="user-password" class="mb-1 block text-xs font-medium text-slate-600">Password</label>
          <input
            id="user-password"
            bind:value={password}
            type="password"
            minlength="8"
            required
            placeholder="Minimal 8 karakter"
            class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          />
        </div>
        <div>
          <label for="user-role" class="mb-1 block text-xs font-medium text-slate-600">Peran</label>
          <select
            id="user-role"
            bind:value={role}
            class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="flex items-end">
          <button
            type="submit"
            disabled={submitting}
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
          >
            {#if submitting}
              <Spinner size={16} />
              Menyimpan...
            {:else}
              Tambah User
            {/if}
          </button>
        </div>
      </form>

      {#if errorMessage}
        <div class="mt-3"><Alert message={errorMessage} variant="error" /></div>
      {/if}
      {#if successMessage}
        <div class="mt-3"><Alert message={successMessage} variant="success" /></div>
      {/if}
    </div>
  </section>

  <section>
    <h2 class="mb-3 text-base font-semibold text-slate-700">Daftar User</h2>
    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table class="w-full min-w-max text-left text-sm">
        <thead class="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            <th class="px-4 py-3">Email</th>
            <th class="px-4 py-3">Peran</th>
            <th class="px-4 py-3">Dibuat</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          {#if loading}
            <tr>
              <td colspan="4" class="px-4 py-6 text-center text-slate-400">Memuat...</td>
            </tr>
          {:else if users.length === 0}
            <tr>
              <td colspan="4" class="px-4 py-6 text-center text-slate-400">Belum ada user.</td>
            </tr>
          {:else}
            {#each users as u (u.id)}
              <tr class="hover:bg-slate-50">
                <td class="px-4 py-3 text-slate-800">{u.email}</td>
                <td class="px-4 py-3">
                  {#if u.role === "admin"}
                    <span class="rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">Admin</span>
                  {:else}
                    <span class="rounded bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">Staff</span>
                  {/if}
                </td>
                <td class="px-4 py-3 text-slate-500">{new Date(u.created_at).toLocaleDateString("id-ID")}</td>
                <td class="px-4 py-3 text-right">
                  <button
                    type="button"
                    onclick={() => onDelete(u)}
                    disabled={deleteLoadingId === u.id || u.id === $admin?.id}
                    class="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-40"
                    title={u.id === $admin?.id ? "Tidak dapat menghapus akun sendiri" : "Hapus user"}
                  >
                    {#if deleteLoadingId === u.id}
                      <Spinner size={14} />
                    {:else}
                      Hapus
                    {/if}
                  </button>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </section>
</AdminShell>