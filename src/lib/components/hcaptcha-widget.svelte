<script lang="ts">
	// See: https://github.com/BillBuilt/sveltekit-hcaptcha
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { PUBLIC_HCAPTCHA_SITE_KEY } from '$env/static/public';

	let {
		id = 'hcaptcha',
		name = 'hCaptchaToken',
		value = $bindable(),
		hCaptcha = $bindable(),
		timeout = 500,
		class: cls = 'captcha',
		size = 'normal',
		theme = 'light'
		// onSuccess
	} : {
		id?: string;
		name?: string;
		value: string | null;
		hCaptcha: any;
		timeout?: number;
		class?: string;
		size?: 'normal' | 'compact';
		theme?: 'light' | 'dark';
		// onSuccess: (token: string) => void
	} = $props();

	/** Expose the `hCaptcha` object, so the widget can be reset from outside this component. */

	let widgetId: string | undefined = $state(undefined);

	// forces 1-way binding
	// export let valid = false;
	// let _valid: boolean;
	// $: valid = _valid;
	let valid = $state(false);

	onMount(() => {
		setTimeout(function () {
			if (browser && 'hcaptcha' in window) {
				console.log(window['hcaptcha']);

				hCaptcha = window['hcaptcha'];
				
				if (hCaptcha.render) {
					widgetId = hCaptcha.render(id, {
						sitekey: PUBLIC_HCAPTCHA_SITE_KEY,
						size,
						callback: onSuccess,
						'error-callback': onError,
						'data-theme': theme
					});
				}
			}
		}, timeout);
	});

	onDestroy(() => {
		if (browser) {
			hCaptcha = null;
		}
	});

	function onSuccess(token: string) {
		value = token;
		// 	dispatch('success', { token });
	}

	function onError(e: any) {
		console.log('onError', e);
		// const { error } = e;
		value = null;
		valid = false;
		hCaptcha.reset(widgetId);
		// dispatch('error', { error });
	}
</script>

<svelte:head>
	<script src="https://js.hcaptcha.com/1/api.js?render=explicit" async defer></script>
</svelte:head>

<div {id} class={cls}></div>

<input type="hidden" {name} bind:value />
