<script lang="ts">
	import type { PageServerData } from "./$types";
    import Settings from "lucide-svelte/icons/settings";
	import UserSettingsForm from "$lib/components/user-settings-form.svelte";

    let { data } : { data: PageServerData } = $props();

    const pageTitle = 'Settings';
</script>

<svelte:head><title>{pageTitle}</title></svelte:head>

<div class="max-w-md mx-auto space-y-4">
    <h2 class="flex items-center gap-2">
        <Settings />
        {pageTitle}
    </h2>

    <UserSettingsForm data={data.form} />
</div>