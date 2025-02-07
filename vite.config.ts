import { defineConfig } from 'vitest/config';
import { paraglide } from '@inlang/paraglide-sveltekit/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
	plugins: [
		sveltekit(),
		paraglide({
			project: './project.inlang',
			outdir: './src/lib/paraglide'
		}),
		mkcert({
			hosts: ['localhost', '127.0.0.1', 'local.knittykitty.co'],
			savePath: './certs', // save the generated certificate into certs directory
			force: true // force generation of certs even without setting https property in the vite config
		})
	],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
