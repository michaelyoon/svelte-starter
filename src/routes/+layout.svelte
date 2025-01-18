<script lang="ts">
	import { i18n } from "$lib/i18n";
	import { ParaglideJS } from "@inlang/paraglide-sveltekit";
	import { ModeWatcher } from "mode-watcher";
	import { getFlash } from "sveltekit-flash-message";
	import { toast } from "svelte-sonner";
	import { page } from "$app/state";
	import { Toaster } from "$lib/components/ui/sonner";
  	import Header from "$lib/components/header.svelte";
	import Footer from "$lib/components/footer.svelte";
	import '../app.css';

	let { data, children } = $props();

	let { user } = $derived(data);

  	const flash = getFlash(page);
		$effect(() => {
		if ($flash) {
			// Display the flash message in a toast.
			const { type, message }	= $flash;

			if (type === 'success') {
				toast.success(message);
			} else if (type === 'error') {
				toast.error(message);
			} else {
				toast(message);
			}

			// Clear the flash message to avoid double-toasting.
			$flash = undefined;
		}
	});
</script>

<ModeWatcher />

<Toaster richColors position="top-center" />

<ParaglideJS {i18n}>
	<div class="flex flex-col h-screen">
		<Header {user} />

		<main class="grow py-6">
			<div class="sm:max-w-lg md:max-w-xl lg:max-w-2xl sm:mx-auto">
				{@render children()}
			</div>
		</main>

		<Footer />
	</div>
</ParaglideJS>
