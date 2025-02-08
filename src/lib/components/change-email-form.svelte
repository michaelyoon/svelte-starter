<script lang="ts">
    import {
        type SuperValidated,
        type Infer,
        superForm,
    } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { changeEmailSchema } from "$lib/drizzle/schema/auth";

    let {
        data
    }: {
        data: SuperValidated<Infer<typeof changeEmailSchema>>
    } = $props();

    const form = superForm(data, {
        validators: zodClient(changeEmailSchema),
    });

    const { form: formData, enhance } = form;
</script>
 
<form method="post" class="space-y-4" use:enhance>
    <Form.Field {form} name="newEmail">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Email</Form.Label>
                <Input type="email" {...props} bind:value={$formData.newEmail} />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="password">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Password</Form.Label>
                <Input type="password" {...props} bind:value={$formData.password} />
            {/snippet}
        </Form.Control>
        <Form.Description>
            Enter your current password.
        </Form.Description>
        <Form.FieldErrors />
    </Form.Field>

    <div class="flex gap-2">
        <Form.Button>Change Email</Form.Button>
        <Form.Button variant="outline" href="/settings">
            Cancel
        </Form.Button>
    </div>
</form>
