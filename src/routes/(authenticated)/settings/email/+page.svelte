<script lang="ts">
	import type { PageServerData } from "./$types";
	import ChangeEmailForm from "$lib/components/change-email-form.svelte";

    let { data } : { data: PageServerData } = $props();

    const pageTitle = 'Change Email';
</script>

<svelte:head><title>{pageTitle}</title></svelte:head>

<div class="max-w-sm mx-auto space-y-4">
    <h2>{pageTitle}</h2>

    <ChangeEmailForm data={data.form} />
</div>