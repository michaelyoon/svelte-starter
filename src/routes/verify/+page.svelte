<script lang="ts">
	import type { PageServerData } from "./$types";
	import VerifyUserForm from "$lib/components/verify-user-form.svelte";

    let { data } : { data: PageServerData } = $props();

    const pageTitle = 'Verify Your Email Address';
</script>

<svelte:head><title>{pageTitle}</title></svelte:head>

<div class="max-w-sm mx-auto space-y-4">
    <h2>{pageTitle}</h2>

    <p>Please enter the code sent to your email address.</p>

    <VerifyUserForm data={data.form} action="?/verify" resendAction="?/resend" />
</div>
