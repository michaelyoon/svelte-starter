<script lang="ts">
	import { superForm, type Infer, type SuperValidated } from "sveltekit-superforms";
	import { verifyUserSchema } from "$lib/drizzle/schema";
	import { zod } from "sveltekit-superforms/adapters";
    import * as Form from "$lib/components/ui/form/index.js";
    import * as InputOTP from "$lib/components/ui/input-otp/index.js";
	import { VERIFICATION_CODE_LENGTH } from "$lib/constants";

    let {
        data,
        action
    } : {
        data: SuperValidated<Infer<typeof verifyUserSchema>>;
        action?: string;
    } = $props();

    const form = superForm(data, zod(verifyUserSchema));

    const { form: formData, enhance } = form;
</script>

<!-- <form action="/?/inputOtp" method="POST" class="w-2/3 space-y-6" use:enhance> -->
<form {action} method="post" class="space-y-4" use:enhance>
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
        <!-- <Form.Description>
            Please enter the one-time password sent to your phone.
        </Form.Description> -->
        <Form.FieldErrors />
    </Form.Field>
    <Form.Button>Verify</Form.Button>
</form>