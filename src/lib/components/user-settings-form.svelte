<script lang="ts">
    import SuperDebug, {
        type SuperValidated,
        type Infer,
        superForm,
    } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
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

    const { form: formData, enhance, submit } = form;
</script>
 
<form method="post" class="space-y-4" use:enhance>
    <EditableFormField {form} type="email" name="email" bind:value={$formData.email}
        onSave={submit}
    >
        {#snippet label()}
            Email
        {/snippet}
    </EditableFormField>

    <EditableFormField {form} name="username" bind:value={$formData.username}
        onSave={submit}
    >
        {#snippet label()}
            Username
        {/snippet}
    </EditableFormField>
</form>

{#if dev}
    <div class="mt-4">
        <SuperDebug data={$formData} collapsible={true} />
    </div>
{/if}