<script lang="ts">
    import SuperDebug, {
        type SuperValidated,
        type Infer,
        superForm,
    } from "sveltekit-superforms";
    import { zodClient } from "sveltekit-superforms/adapters";
    import * as Form from "$lib/components/ui/form/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
	import HcaptchaWidget from "./hcaptcha-widget.svelte";
    import { registerSchema } from "$lib/drizzle/schema/auth";
	import { dev } from "$app/environment";

    let {
        data
    }: {
        data: SuperValidated<Infer<typeof registerSchema>>
    } = $props();

    const form = superForm(data, {
        validators: zodClient(registerSchema),
    });

    const { form: formData, enhance, errors, allErrors, tainted, isTainted } = form;

    let hCaptcha: any | undefined = $state(undefined);

    $effect(() => {
        if ($allErrors.length > 0) {
            hCaptcha?.reset();
        }
    });
</script>
 
<form method="post" class="space-y-4" use:enhance>
    <Form.Field {form} name="email" class="space-y-1">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Email</Form.Label>
                <Input type="email" {...props} bind:value={$formData.email} autofocus />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Field {form} name="username" class="space-y-1">
        <Form.Control>
            {#snippet children({ props })}
                <Form.Label>Username</Form.Label>
                <Input {...props} bind:value={$formData.username} />
            {/snippet}
        </Form.Control>
        <Form.Description>This is your public display name.</Form.Description>
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

    <Form.Field {form} name="hCaptchaToken">
        <Form.Control>
            {#snippet children({ props })}
                <HcaptchaWidget bind:hCaptcha bind:value={$formData.hCaptchaToken} />
            {/snippet}
        </Form.Control>
        <Form.FieldErrors />
    </Form.Field>

    <Form.Button type="submit"
        disabled={!isTainted($tainted)}
    >
        Create Account
    </Form.Button>

    <div class="text-sm">
        Already have an account?
        <a href="/login" class="link">Sign in.</a>
    </div>
</form>

{#if dev}
    <div class="mt-4">
        <SuperDebug data={$formData} collapsible={true} />
    </div>
{/if}