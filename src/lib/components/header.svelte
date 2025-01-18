<script lang="ts">
	import { toggleMode } from "mode-watcher";
	import Sun from "lucide-svelte/icons/sun";
	import Moon from "lucide-svelte/icons/moon";
	import { Button } from "$lib/components/ui/button/index.js";
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
        <Button onclick={toggleMode} variant="outline" size="icon">
            <Sun
                class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
            />
            <Moon
                class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            />
            <span class="sr-only">Toggle theme</span>
        </Button>

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
