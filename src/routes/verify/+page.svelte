<script lang="ts">
	import type { PageServerData } from "./$types";
	import VerifyUserForm from "$lib/components/verify-user-form.svelte";

    let { data } : { data: PageServerData } = $props();

    const pageTitle = 'Verify Your Account';
</script>

<svelte:head><title>{pageTitle}</title></svelte:head>

<div class="max-w-sm mx-auto space-y-4">
    <h2>{pageTitle}</h2>

    <VerifyUserForm action="?/verify" data={data.form} />
</div>
