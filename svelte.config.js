// /** @type {import('@sveltejs/kit').Config} */
import adapter from '@sveltejs/adapter-static';
// // import { resolve } from "path";
// // import { visualizer } from 'rollup-plugin-visualizer'

// import path from 'path';
// const config = {
// 	kit: {
// 		adapter: adapter({
// 			// default options are shown
// 			pages: 'build',
// 			assets: 'build',
// 			fallback: null
// 		}),
// 		vite: {
// 			// build: {
// 			// 	rollupOptions: {
// 			// 		output: {
// 			// 			manualChunks: undefined
// 			// 		},
// 			// 	}
// 			// },
// 			resolve: {
// 				alias: {
// 					// $utils: path.resolve('./src/utils')
// 					$utils: path.resolve('./src/utils')
// 					// "@": resolve(__dirname, "src"),
// 				}
// 			},
// 			// plugins: [
// 			// 	visualizer()
// 			// ]
// 		},
// 		// hydrate the <div id="svelte"> element in src/app.html
// 		// target: '#svelte',
// 		files: {
// 			assets: 'static',
// 			hooks: 'src/hooks',
// 			lib: 'src/lib',
// 			routes: 'src/routes',
// 			serviceWorker: 'src/service-worker',
// 			template: 'src/app.html'
// 		},
// 	}
// };

// export default config;



// import adapter from '@sveltejs/adapter-auto';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: preprocess(),

	kit: {
		adapter: adapter()
	}
};

export default config;
