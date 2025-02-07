<script lang="ts">
	import type { Snippet } from "svelte";
    import Menu from "lucide-svelte/icons/menu";
    import * as Sheet from "$lib/components/ui/sheet/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import type { SessionUser } from "$lib/server/auth";
	import { cn } from "$lib/utils";
	import { PUBLIC_APP_NAME } from "$env/static/public";

    let {
        user,
        title,
        content,
        class: cls
    } : {
        user: SessionUser | null;
        title?: Snippet;
        content?: Snippet;
        class?: string;
    }= $props();

    let open = $state(false);
</script>

<Sheet.Root bind:open>
    <Sheet.Trigger class={cn(buttonVariants({ variant: 'outline', size: 'icon' }), cls)}>
        <Menu />
    </Sheet.Trigger>
    <!--
        By default, "[w]hen a Dialog closes, focus returns to the element that triggered its
        opening (typically the Dialog.Trigger)."

        Prevent this, so that `autofocus` works on the loaded page.
    -->
    <Sheet.Content
        onCloseAutoFocus={(e) => {
			e.preventDefault();
        }}
    >
        <Sheet.Header>
            <Sheet.Title>
                {#if title}
                    {@render title()}
                {:else}
                    {#if user}
                        Hi, {user.username}
                    {:else}
                        Welcome to {PUBLIC_APP_NAME}
                    {/if}
                {/if}
            </Sheet.Title>
        </Sheet.Header>
        {#if content}
            {@render content()}
        {:else}
            <div class="py-4 flex flex-col gap-4">
                {#if user}
                    <form action="/logout" method="post">
                        <Button type="submit">Sign Out</Button>
                    </form>
                {:else}
                        <div class="flex flex-col gap-1.5">
                            Create a free account now.
                            <Button href="/register"
                                onclick={() => { open = false; }}
                            >
                                Sign Up
                            </Button>
                        </div>

                        <div class="flex flex-col gap-1.5">
                            Already have an account?
                            <Button href="/login"
                                onclick={() => { open = false; }}
                            >
                                Sign In
                            </Button>
                        </div>
                {/if}
            </div>
        {/if}
    </Sheet.Content>
</Sheet.Root>

