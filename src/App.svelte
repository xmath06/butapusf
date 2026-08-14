<script lang="ts">
  import { currentPath, ROUTES } from "./lib/router.svelte";
  import CheckInPage from "./lib/features/checkin/CheckInPage.svelte";
  import LoginPage from "./lib/features/auth/LoginPage.svelte";
  import DashboardPage from "./lib/features/admin/DashboardPage.svelte";
  import UsersPage from "./lib/features/admin/users/UsersPage.svelte";
  import SettingsPage from "./lib/features/admin/settings/SettingsPage.svelte";
</script>

{#if $currentPath === ROUTES.login}
  <LoginPage />
{:else if $currentPath === ROUTES.dashboard}
  <DashboardPage />
{:else if $currentPath === ROUTES.users}
  <UsersPage />
{:else if $currentPath === ROUTES.settings}
  <SettingsPage />
{:else}
  <CheckInPage />
{/if}