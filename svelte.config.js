/** @type {import('@sveltejs/kit').Config} */
import adapter from '@sveltejs/adapter-static';
// import { resolve } from "path";
import path from 'path';
const config = {
	kit: {
		adapter: adapter({
			// default options are shown
			pages: 'build',
			assets: 'build',
			fallback: null
		}),
		vite: {
			resolve: {
				alias: {
					// $utils: path.resolve('./src/utils')
					$utils: path.resolve('./src/utils')
					// "@": resolve(__dirname, "src"),
				}
			}
		},
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		files: {
			assets: 'static',
			hooks: 'src/hooks',
			lib: 'src/lib',
			routes: 'src/routes',
			serviceWorker: 'src/service-worker',
			template: 'src/app.html'
		},
	}
};

export default config;
