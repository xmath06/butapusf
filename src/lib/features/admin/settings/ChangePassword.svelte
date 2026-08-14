<script lang="ts">
  import { changePassword } from "../../../api";
  import Alert from "../../../components/Alert.svelte";
  import Spinner from "../../../components/Spinner.svelte";

  let currentPassword = $state("");
  let newPassword = $state("");
  let confirmPassword = $state("");
  let submitting = $state(false);
  let errorMessage = $state("");
  let successMessage = $state("");

  function reset() {
    currentPassword = "";
    newPassword = "";
    confirmPassword = "";
  }

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    errorMessage = "";
    successMessage = "";

    if (newPassword.length < 8) {
      errorMessage = "Password baru minimal 8 karakter";
      return;
    }
    if (newPassword !== confirmPassword) {
      errorMessage = "Konfirmasi password tidak cocok";
      return;
    }

    submitting = true;
    try {
      const result = await changePassword(currentPassword, newPassword);
      successMessage = result.message ?? "Password berhasil diubah";
      reset();
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : "Gagal mengubah password";
    } finally {
      submitting = false;
    }
  }
</script>

<div class="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
  <h3 class="mb-1 text-sm font-semibold text-slate-700">Ganti Password</h3>
  <p class="mb-4 text-xs text-slate-500">Perbarui kata sandi untuk akun admin Anda.</p>

  <form onsubmit={onSubmit} class="space-y-3">
    <div>
      <label for="current-password" class="mb-1 block text-xs font-medium text-slate-600">
        Password saat ini
      </label>
      <input
        id="current-password"
        bind:value={currentPassword}
        type="password"
        autocomplete="current-password"
        required
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />
    </div>

    <div>
      <label for="new-password" class="mb-1 block text-xs font-medium text-slate-600">
        Password baru
      </label>
      <input
        id="new-password"
        bind:value={newPassword}
        type="password"
        autocomplete="new-password"
        minlength="8"
        required
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />
      <p class="mt-1 text-xs text-slate-400">Minimal 8 karakter.</p>
    </div>

    <div>
      <label for="confirm-password" class="mb-1 block text-xs font-medium text-slate-600">
        Konfirmasi password baru
      </label>
      <input
        id="confirm-password"
        bind:value={confirmPassword}
        type="password"
        autocomplete="new-password"
        minlength="8"
        required
        class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
      />
    </div>

    {#if errorMessage}
      <Alert message={errorMessage} variant="error" />
    {/if}
    {#if successMessage}
      <Alert message={successMessage} variant="success" />
    {/if}

    <button
      type="submit"
      disabled={submitting}
      class="flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
    >
      {#if submitting}
        <Spinner size={16} />
        Menyimpan...
      {:else}
        Simpan Password
      {/if}
    </button>
  </form>
</div>