<script lang="ts">
  let {
    message = "",
    variant = "error",
  }: {
    message?: string;
    variant?: "error" | "success" | "info";
  } = $props();

  const styles: Record<string, string> = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    info: "border-sky-200 bg-sky-50 text-sky-700",
  };
</script>

{#if message}
  <div class="rounded-lg border px-4 py-3 text-sm {styles[variant]}" role="alert">
    {message}
  </div>
{/if}
