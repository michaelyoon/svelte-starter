<script lang="ts">
	import { Button, Heading, Hr, Html, Text } from '@sveltelaunch/svelte-5-email';

	let {
        appName,
        verificationCode
    } : {
        appName: string;
        verificationCode: string;
    } = $props();
</script>

<Html lang="en">
    <Heading as="h1">{appName}</Heading>

    <Text>
		Here is your verification code:
	</Text>

    <Text style={{ fontSize: 'xl' }}>
		{verificationCode}
	</Text>
	<Hr />
</Html>
