<script lang="ts" generics="Form extends FsSuperForm<Record<string, unknown>, any>, ValueType">
	import { tick, type Snippet } from "svelte";
	import type { FsSuperForm } from "formsnap";
	import type { HTMLInputTypeAttribute } from "svelte/elements";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input/index.js";

    let {
        form,
        type,
        name,
        value = $bindable(),
        label,
        description,
        class: cls,
        inputClass = 'disabled:opacity-75',
        onSave
    } : {
        form: Form;
        type?: HTMLInputTypeAttribute;
        name: string;
        value: ValueType;
        label?: Snippet;
        description?: Snippet;
        class?: string;
        inputClass?: string;
        onSave?: () => void | Promise<void>;
    } = $props();

    const { validate } = form;

    let ref: HTMLInputElement | null = $state(null);

    let editing = $state(false);

    let originalValue: ValueType | undefined = $state(undefined);
</script>

<Form.Field {form} {name} class={cls}>
    <Form.Control>
        {#snippet children({ props })}
            {#if label}
                <Form.Label>{@render label()}</Form.Label>
            {/if}
            <div class="flex gap-2">
                <!-- XXX: The `value` prop does not appear in the HTML, for some reason. -->
                <Input {type} {...props} bind:value bind:ref disabled={!editing}
                    class={inputClass}
                />
                {#if !editing}
                    <Form.Button type="button" variant="outline"
                        onclick={async () => {
                            originalValue = value;
                            editing = true;
                            await tick();
                            ref?.focus();
                        }}
                    >
                        Change
                    </Form.Button>
                {:else}
                    <Form.Button type="button"
                        onclick={async () => {
                            const errors = await validate(name, { update: true });
                            if (!errors) {
                                editing = false;
                                await tick();
                                if (onSave) {
                                    Promise.resolve(onSave());
                                }
                            }
                        }}
                        disabled={value === originalValue}
                    >
                        Save
                    </Form.Button>

                    <Form.Button type="button" variant="outline"
                        onclick={() => {
                            if (originalValue) {
                                value = originalValue;
                            }
                            editing = false;
                        }}
                    >
                        Cancel
                    </Form.Button>
                {/if}
            </div>
        {/snippet}
    </Form.Control>
    {#if description}
        <Form.Description>
            {@render description()}
        </Form.Description>
    {/if}
    <Form.FieldErrors />
</Form.Field>
