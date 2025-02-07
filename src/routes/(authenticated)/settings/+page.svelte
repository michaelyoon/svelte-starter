<script lang="ts">
	import type { PageServerData } from "./$types";
	import UserSettingsForm from "$lib/components/user-settings-form.svelte";

    let { data } : { data: PageServerData } = $props();

    const pageTitle = 'Settings';
</script>

<svelte:head><title>{pageTitle}</title></svelte:head>

<h2 class="mb-4">{pageTitle}</h2>

<UserSettingsForm data={data.form} />
