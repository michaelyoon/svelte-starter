import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import mkcert from 'vite-plugin-mkcert';

export default ({ mode }: { mode: string }) => {
	// For some reason, `import.meta.env` is undefined.
	// See: https://stackoverflow.com/a/70711383
	const env = loadEnv(mode, process.cwd());

	return defineConfig({
		plugins: [
			sveltekit(),
			paraglide({
				project: './project.inlang',
				outdir: './src/lib/paraglide'
			}),
			mkcert({
				// hCaptcha "prohibits `localhost` and `127.0.0.1` as supplied hostnames"
				// @see https://docs.hcaptcha.com/#local-development
				hosts: [env.VITE_MKCERT_HOSTNAME],
				savePath: './certs', // save the generated certificate into certs directory
				force: true // force generation of certs even without setting https property in the vite config
			})
		],

		test: {
			include: ['src/**/*.{test,spec}.{js,ts}']
		}
	});
};
