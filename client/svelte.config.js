import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			precompress: false,
			fallback: 'index.html'
		}),
		// Path for GitHub pages
		//paths: {
		//	base: process.env.NODE_ENV === "production" ? "/ssnake" : "",
		//},
	},
	compilerOptions: {
		accessors: true
	},

};

export default config;
