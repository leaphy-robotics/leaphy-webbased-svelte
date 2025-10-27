import path from "node:path";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { svelte, vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		svelte({
			preprocess: vitePreprocess({
				script: true,
			}),
		}),
		topLevelAwait(),
		viteStaticCopy({
			targets: [
				{
					src: "./node_modules/@leaphy-robotics/leaphy-blocks/media/*",
					dest: "blockly-assets",
				},
				{
					src: "./node_modules/@leaphy-robotics/picotool-wasm/build/*",
					dest: "picotool",
				},
			],
		}),
		// Upload source maps to Sentry
		sentryVitePlugin({
			url: "https://leaphyeasybloqs.com:8443",
			project: "leaphy-webbased-svelte",
			org: "leaphy",
			authToken: process.env.SENTRY_AUTH_TOKEN,
		}),
	],
	resolve: {
		alias: {
			$components: path.resolve(__dirname, "./src/lib/components"),
			$assets: path.resolve(__dirname, "./src/assets"),
			$domain: path.resolve(__dirname, "./src/lib/domain"),
			$state: path.resolve(__dirname, "./src/lib/state"),
			$education: path.resolve(__dirname, "./src/lib/education"),
		},
	},
	server: {
		headers: {
			"Cross-Origin-Embedder-Policy": "require-corp",
			"Cross-Origin-Opener-Policy": "same-origin",
		},
	},
	build: {
		sourcemap: true,
		target: "esnext",
	},
});
