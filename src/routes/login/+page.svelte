<script lang="ts">
	import { PUBLIC_APP_NAME } from "$env/static/public";
	import LoginForm from "$lib/components/login-form.svelte";

    let { data } = $props();

    const title = 'Sign In';
</script>

<svelte:head><title>{title} · {PUBLIC_APP_NAME}</title></svelte:head>

<div class="max-w-xs mx-auto">
    <h2>{title}</h2>

    <LoginForm {data} />
</div>
