<script lang="ts">
    import SuperDebug, {
        type SuperValidated,
        type Infer,
        superForm,
    } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { loginSchema } from "$lib/drizzle/schema/auth";
	import { dev } from "$app/environment";

    let { data }: { data: { form: SuperValidated<Infer<typeof loginSchema>> } } = $props();

    const form = superForm(data.form, {
        validators: zodClient(loginSchema),
    });

    const { form: formData, enhance, tainted, isTainted, errors } = form;
</script>
 
<form method="post" class="space-y-4" use:enhance>
    <Form.Field {form} name="username" class="space-y-1">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Username</Form.Label>
                <Input {...props} bind:value={$formData.username}
                    autofocus
                />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="password" class="space-y-1">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Password</Form.Label>
                <Input type="password" {...props} bind:value={$formData.password} />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Button type="submit"
        disabled={!isTainted($tainted)}
    >
        Sign In
    </Form.Button>
</form>

{#if dev}
    <div class="mt-4">
        <SuperDebug data={$formData} collapsible={true} />
    </div>
{/if}