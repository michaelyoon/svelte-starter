<script lang="ts">
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import { resetPasswordSchema } from "$lib/drizzle/schema";
	import { zod } from "sveltekit-superforms/adapters";
    import * as Form from "$lib/components/ui/form/index.js";
    import * as InputOTP from "$lib/components/ui/input-otp/index.js";
	import Input from "$lib/components/ui/input/input.svelte";
	import { VERIFICATION_CODE_LENGTH } from "$lib/constants";

    let {
        data,
        action,
        resendAction
    } : {
        data: SuperValidated<Infer<typeof resetPasswordSchema>>;
        action?: string;
        resendAction?: string;
    } = $props();

    const form = superForm(data, zod(resetPasswordSchema));

    const { form: formData, enhance } = form;

    const resendForm = superForm({});

    const { enhance: resendEnhance } = resendForm;
</script>

<form {action} method="post" class="space-y-4" use:enhance>
    <p>Please enter the code sent to your email address.</p>

    <Form.Field {form} name="verificationCode">
        <Form.Control>
            {#snippet children({ props })}
                <InputOTP.Root maxlength={VERIFICATION_CODE_LENGTH} {...props}
                    bind:value={$formData.verificationCode}
                >
                    {#snippet children({ cells })}
                        <InputOTP.Group>
                            {#each cells as cell}
                                <InputOTP.Slot {cell} />
                            {/each}
                        </InputOTP.Group>
                    {/snippet}
                </InputOTP.Root>
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
        <Form.FieldErrors />
    </Form.Field>

    <Form.Button>Reset Password</Form.Button>
</form>

{#if resendAction}
    <form action={resendAction} method="post" class="space-y-4" use:resendEnhance>
        <button type="submit" class="text-sm">
            Resend code
        </button>
    </form>
{/if}
