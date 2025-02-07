<script lang="ts">
	import { PUBLIC_APP_NAME } from "$env/static/public";
	import RegisterForm from "$lib/components/register-form.svelte";

    let { data } = $props();

    const title = 'Sign Up';
</script>

<svelte:head><title>{title} · {PUBLIC_APP_NAME}</title></svelte:head>

<div class="max-w-xs mx-auto space-y-4">
    <h2>{title}</h2>

    <RegisterForm data={data.form} />
</div>
