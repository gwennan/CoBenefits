// import adapter from '@sveltejs/adapter-auto';
import {vitePreprocess} from '@sveltejs/vite-plugin-svelte'
import adapter from '@sveltejs/adapter-static';
// import {sveltePreprocess} from "svelte-preprocess";


const dev = process.argv.includes('dev');
console.log(23232323, dev, process.env.NODE_ENV)

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
    // for more information about preprocessors
    // preprocess: [sveltePreprocess()],
    preprocess: [vitePreprocess()],
    kit: {
        // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
        // If your environment is not supported, or you settled on a specific environment, switch out the adapter.
        // See https://kit.svelte.dev/docs/adapters for more information about adapters.
        adapter: adapter({
            assets: "build",
            pages: "build"
        }),

        paths: {
            // base: dev === "production" ? "/CoBenefits" : "",
            // base: process.env.NODE_ENV === "production" ? "/CoBenefits" : "",
            base: "",
            // base: "/ECCI/build",
            // base: "/ECCI",
            // assets: dev ? '' : '/30DayChartChallenge-2023'
        }
    },
}

export default config;
