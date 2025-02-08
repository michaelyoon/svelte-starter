<script lang="ts">
    import SuperDebug, {
        type SuperValidated,
        type Infer,
        superForm,
    } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
	import EditableFormField from "./editable-form-field.svelte";
    import { userSettingsSchema } from "$lib/drizzle/schema/auth";
	import { dev } from "$app/environment";

    let {
        data
    }: {
        data: SuperValidated<Infer<typeof userSettingsSchema>>
    } = $props();

    const form = superForm(data, {
        // XXX: The `value` prop does not appear in the HTML, for some reason.
        dataType: 'json',
        validators: zodClient(userSettingsSchema),
    });

    const { form: formData, errors, enhance, submit } = form;
</script>
 
<form method="post" class="space-y-4" use:enhance>
    <Form.Field {form} name="password">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Email</Form.Label>
                <div class="flex gap-2">
                    <Input type="email" {...props} value={$formData.email} disabled={true} />
                    <Form.Button variant="outline" href="/settings/email">Change</Form.Button>
                </div>
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <EditableFormField {form} name="username" bind:value={$formData.username}
        onSave={submit}
    >
        {#snippet label()}
            Username
        {/snippet}
        {#snippet description()}
            This is your public display name.
        {/snippet}
    </EditableFormField>

    <Form.Field {form} name="password">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Password</Form.Label>
                <div class="flex gap-2">
                    <Input type="password" {...props} placeholder="********************" disabled={true} />
                    <Form.Button variant="outline" href="/settings/password">Change</Form.Button>
                </div>
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>
</form>

{#if dev}
    <div class="mt-4">
        <SuperDebug data={$formData} collapsible={true} />
    </div>
{/if}