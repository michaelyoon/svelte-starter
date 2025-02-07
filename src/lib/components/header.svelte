<script lang="ts">
	import type { Snippet } from "svelte";
    import LogIn from "lucide-svelte/icons/log-in";
	import { Button } from "$lib/components/ui/button/index.js";
	import DarkModeMenu from "./dark-mode-menu.svelte";
	// import DarkModeSwitch from "./dark-mode-switch.svelte";
	import UserSheet from "./user-sheet.svelte";
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
        <DarkModeMenu />
        <!-- <DarkModeSwitch /> -->

        {#if user}
            <UserSheet {user} />
        {:else}
            <div class="flex flex-col gap-1.5">
                <Button href="/login" variant="outline">
                    <!-- <LogIn /> -->
                    Sign In
                </Button>
            </div>
            
            <div class="flex flex-col gap-1.5">
                <Button href="/register" variant="outline">
                    Sign Up
                </Button>
            </div>
        {/if}
    </div>
</header>
