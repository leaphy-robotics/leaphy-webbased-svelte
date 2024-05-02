import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { sentryVitePlugin } from "@sentry/vite-plugin";


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), viteStaticCopy({
    targets: [
      {
        src: './node_modules/@leaphy-robotics/leaphy-blocks/media/*',
        dest: 'blockly-assets'
      },
      {
        src: './node_modules/@leaphy-robotics/avrdude-webassembly/avrdude.wasm',
        dest: ''
      },
      {
        src: './node_modules/@leaphy-robotics/avrdude-webassembly/avrdude-worker.js',
        dest: ''
      },
      {
        src: './node_modules/@leaphy-robotics/avrdude-webassembly/avrdude.conf',
        dest: ''
      },
      {
        src: "./node_modules/@leaphy-robotics/dfu-util-wasm/build/*",
        dest: 'dfu-util'
      },
      {
        src: "./node_modules/@leaphy-robotics/picotool-wasm/build/*",
        dest: 'picotool'
      },
    ]
  }),
  // Upload source maps to Sentry
  sentryVitePlugin({
    url: "https://leaphyeasybloqs.com:8443/",
    project: "leaphy-webbased-svelte",
    org: 'leaphy',
    authToken: process.env.SENTRY_AUTH_TOKEN,
  })
  ],
  resolve: {
    alias: {
      $components: path.resolve(__dirname, './src/lib/components'),
      $assets: path.resolve(__dirname, './src/assets'),
      $domain: path.resolve(__dirname, './src/lib/domain'),
      $state: path.resolve(__dirname, './src/lib/state'),
      $examples: path.resolve(__dirname, './src/lib/examples')
    }
  },
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin"
    }
  },
  build: {
    target: 'es2022',
    sourcemap: true
  }
})
