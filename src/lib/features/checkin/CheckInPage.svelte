<script lang="ts">
  import { checkIn } from "../../api";
  import type { CheckInResult } from "../../types";
  import Spinner from "../../components/Spinner.svelte";
  import Alert from "../../components/Alert.svelte";

  let fullName = $state("");
  let nikOrPhone = $state("");
  let email = $state("");
  let address = $state("");
  let purpose = $state("");
  let pesan = $state("");
  let checkInTime = $state(toLocalInputValue(new Date()));
  let loading = $state(false);
  let errorMessage = $state("");
  let submitted: CheckInResult | null = $state(null);

  function pad(n: number): string {
    return String(n).padStart(2, "0");
  }

  /** Format Date ke nilai input datetime-local (YYYY-MM-DDTHH:MM) lokal. */
  function toLocalInputValue(d: Date): string {
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function validate(): string {
    if (fullName.trim().length < 2) return "Nama lengkap wajib diisi (minimal 2 karakter)";
    if (address.trim().length < 3) return "Alamat / institusi wajib diisi";
    if (nikOrPhone.trim() !== "" && nikOrPhone.trim().length < 6)
      return "NIK / No. HP minimal 6 karakter";
    if (purpose.trim().length < 2) return "Tujuan wajib diisi";
    if (email.trim() !== "" && !/^\S+@\S+\.\S+$/.test(email.trim()))
      return "Format email tidak valid";
    return "";
  }

  async function onSubmit() {
    errorMessage = "";
    const err = validate();
    if (err) {
      errorMessage = err;
      return;
    }
    loading = true;
    try {
      submitted = await checkIn({
        full_name: fullName.trim(),
        nik_or_phone: nikOrPhone.trim() || undefined,
        email: email.trim() || undefined,
        address_or_institution: address.trim(),
        purpose: purpose.trim(),
        pesan: pesan.trim() || undefined,
        checked_in_at: new Date(checkInTime).toISOString(),
      });
      fullName = "";
      nikOrPhone = "";
      email = "";
      address = "";
      purpose = "";
      pesan = "";
      checkInTime = toLocalInputValue(new Date());
    } catch (e) {
      errorMessage = e instanceof Error ? e.message : "Gagal check-in, silakan coba lagi";
    } finally {
      loading = false;
    }
  }

  function resetForm() {
    submitted = null;
    errorMessage = "";
  }
</script>

<svelte:head>
  <title>Check-in Tamu - Buku Tamu Puskesmas</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-b from-sky-50 to-slate-100 px-4 py-10">
  <div class="mx-auto w-full max-w-md">
    <header class="mb-6 text-center">
      <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-2xl text-white shadow-lg">
        🏥
      </div>
      <h1 class="text-2xl font-bold text-slate-800">Buku Tamu Puskesmas</h1>
      <p class="mt-1 text-sm text-slate-500">Form kunjungan, kedinasan, inspeksi, atau tamu vendor</p>
    </header>

    {#if submitted}
      <div class="rounded-2xl border border-emerald-200 bg-white p-6 text-center shadow-sm">
        <div class="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl">✓</div>
        <h2 class="text-lg font-semibold text-emerald-700">Check-in Berhasil</h2>
        <p class="mt-1 text-sm text-slate-500">
          Selamat datang, <span class="font-medium text-slate-700">{submitted.full_name}</span>
        </p>
        <dl class="mt-4 space-y-1 rounded-lg bg-slate-50 p-4 text-left text-sm">
          <div class="flex justify-between"><dt class="text-slate-500">Tujuan</dt><dd class="font-medium">{submitted.purpose}</dd></div>
          {#if submitted.email}
            <div class="flex justify-between"><dt class="text-slate-500">Email</dt><dd class="font-medium">{submitted.email}</dd></div>
          {/if}
          <div class="flex justify-between"><dt class="text-slate-500">Waktu</dt><dd class="font-medium">{new Date(submitted.checked_in_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</dd></div>
        </dl>
        <button
          type="button"
          onclick={resetForm}
          class="mt-5 w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
        >
          Check-in Tamu Berikutnya
        </button>
      </div>
    {:else}
      <form
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        onsubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <div class="space-y-4">
          <div>
            <label for="full_name" class="mb-1 block text-sm font-medium text-slate-700">Nama Lengkap <span class="text-red-500">*</span></label>
            <input
              id="full_name"
              bind:value={fullName}
              type="text"
              placeholder="Contoh: Budi Santoso"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              required
            />
          </div>

          <div>
            <label for="nik_or_phone" class="mb-1 block text-sm font-medium text-slate-700">NIK / No. HP</label>
            <input
              id="nik_or_phone"
              bind:value={nikOrPhone}
              type="text"
              inputmode="numeric"
              placeholder="Opsional"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label for="email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input
              id="email"
              bind:value={email}
              type="email"
              placeholder="Opsional, contoh: budi@email.com"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label for="address" class="mb-1 block text-sm font-medium text-slate-700">Alamat / Institusi <span class="text-red-500">*</span></label>
            <input
              id="address"
              bind:value={address}
              type="text"
              placeholder="Contoh: Jl. Merdeka No. 10"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              required
            />
          </div>

          <div>
            <label for="purpose" class="mb-1 block text-sm font-medium text-slate-700">Tujuan <span class="text-red-500">*</span></label>
            <input
              id="purpose"
              bind:value={purpose}
              type="text"
              placeholder="Tulis tujuan kunjungan, contoh: Rapat koordinasi"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
              required
            />
          </div>

          <div>
            <label for="check_in_time" class="mb-1 block text-sm font-medium text-slate-700">Waktu Kunjungan / Masuk</label>
            <input
              id="check_in_time"
              bind:value={checkInTime}
              type="datetime-local"
              class="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            />
          </div>

          <div>
            <label for="pesan" class="mb-1 block text-sm font-medium text-slate-700">Pesan</label>
            <textarea
              id="pesan"
              bind:value={pesan}
              rows="2"
              maxlength="200"
              placeholder="Opsional, contoh: menemui pak RT untuk koordinasi jadwal"
              class="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
            ></textarea>
          </div>
        </div>

        <div class="mt-5">
          <Alert message={errorMessage} />
        </div>

        <button
          type="submit"
          disabled={loading}
          class="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {#if loading}
            <Spinner size={16} />
            Menyimpan...
          {:else}
            Check-in Sekarang
          {/if}
        </button>

        <a href="#/login" class="mt-4 block text-center text-xs text-slate-400 hover:text-slate-600">
          Admin? Masuk di sini
        </a>
      </form>
    {/if}

    <p class="mt-6 text-center text-xs text-slate-400">
      © {new Date().getFullYear()} Puskesmas — Sistem Buku Tamu
    </p>
  </div>
</div>