<script lang="ts">
	import DarkModeSwitch from "./dark-mode-switch.svelte";
	import DarkModeMenu from "./dark-mode-menu.svelte";
	import { PUBLIC_APP_NAME } from "$env/static/public";

    let { user } = $props();
</script>

<header class="p-4 flex justify-between border-b">
    <h1>
        <a href="/" class="flex items-center gap-1">
            {PUBLIC_APP_NAME}
        </a>
    </h1>

    <div class="flex items-center gap-2">
        <!-- Choose one of these two components: -->
        <DarkModeSwitch />
        <DarkModeMenu />

        {#if user}
            <form action="/logout" method="post">
                <button type="submit">Sign Out</button>
            </form>
        {:else}
            <a href="/register">Create Account</a>
            <a href="/login">Sign In</a>
        {/if}
    </div>
</header>
