<script lang="ts">
	import type { Snippet } from "svelte";
    import Menu from "lucide-svelte/icons/menu";
    import Settings from "lucide-svelte/icons/settings";
    import { Separator } from "$lib/components/ui/separator/index.js";
    import LogOut from "lucide-svelte/icons/log-out";
    import * as Sheet from "$lib/components/ui/sheet/index.js";
	import { Button, buttonVariants } from "$lib/components/ui/button/index.js";
	import type { SessionUser } from "$lib/server/auth";
	import { cn } from "$lib/utils";

    let {
        user,
        title,
        content,
        class: cls,
        buttonClass = 'justify-start w-full p-1.5'
    } : {
        user: SessionUser;
        title?: Snippet;
        content?: Snippet;
        class?: string;
        buttonClass?: string;
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
                    {user.username}
                {/if}
            </Sheet.Title>
        </Sheet.Header>
        {#if content}
            {@render content()}
        {:else}            
            <div class="py-4 flex flex-col gap-2">
                <Separator />

                <Button variant="ghost" class={buttonClass}
                    href="/settings"
                    onclick={() => { open = false; }}
                >
                    <Settings />
                    Settings
                </Button>

                <Separator />

                <form action="/logout" method="post">
                    <Button type="submit" variant="ghost" class={buttonClass}>
                        <LogOut />
                        Sign Out
                    </Button>
                </form>
            </div>
        {/if}
    </Sheet.Content>
</Sheet.Root>

