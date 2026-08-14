<script lang="ts">
  import AdminShell from "../AdminShell.svelte";
  import ChangePassword from "./ChangePassword.svelte";
</script>

<svelte:head>
  <title>Pengaturan - Buku Tamu Puskesmas</title>
</svelte:head>

<AdminShell>
  <section>
    <h2 class="mb-3 text-base font-semibold text-slate-700">Pengaturan Akun</h2>
    <ChangePassword />
  </section>
</AdminShell>