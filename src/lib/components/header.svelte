<script lang="ts">
	import type { Snippet } from "svelte";
	import DarkModeSwitch from "./dark-mode-switch.svelte";
	import DarkModeMenu from "./dark-mode-menu.svelte";
	import AuthSheet from "./auth-sheet.svelte";
	import type { SessionUser } from "$lib/server/auth";
	import { PUBLIC_APP_NAME } from "$env/static/public";

    let {
        user,
        heading
    } : {
        heading?: Snippet;
        user: SessionUser | null
    } = $props();
</script>

<header class="p-4 flex justify-between border-b">
    <h1>
        {#if heading}
            {@render heading()}
        {:else}
            <a href="/">{PUBLIC_APP_NAME}</a>
        {/if}
    </h1>

    <div class="flex items-center gap-2">
        <!-- Choose one of these two components: -->
        <DarkModeSwitch />
        <DarkModeMenu />

        <AuthSheet {user} />
    </div>
</header>
