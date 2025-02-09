<script lang="ts">
	import type { PageServerData } from "./$types";
	import ForgotPasswordForm from "$lib/components/forgot-password-form.svelte";

    let { data } : { data: PageServerData } = $props();

    const pageTitle = 'Reset Password';
</script>

<svelte:head><title>{pageTitle}</title></svelte:head>

<div class="max-w-sm mx-auto space-y-4">
    <h2>{pageTitle}</h2>

    <div>If you forgot your password, enter your email, and we'll send you a link to reset it.</div>

    <ForgotPasswordForm data={data.form} />
</div>
