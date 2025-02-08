<script lang="ts">
	import type { PageServerData } from "./$types";
	import ChangePasswordForm from "$lib/components/change-password-form.svelte";

    let { data } : { data: PageServerData } = $props();

    const pageTitle = 'Change Password';
</script>

<svelte:head><title>{pageTitle}</title></svelte:head>

<div class="max-w-sm mx-auto space-y-4">
    <h2>{pageTitle}</h2>

    <ChangePasswordForm data={data.form} />
</div>