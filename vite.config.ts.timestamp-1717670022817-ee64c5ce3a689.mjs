// vite.config.ts
import { defineConfig } from "file:///C:/Users/Jasper/Desktop/Leaphy/leaphy-webbased-svelte/node_modules/vite/dist/node/index.js";
import { svelte } from "file:///C:/Users/Jasper/Desktop/Leaphy/leaphy-webbased-svelte/node_modules/@sveltejs/vite-plugin-svelte/src/index.js";
import path from "path";
import { viteStaticCopy } from "file:///C:/Users/Jasper/Desktop/Leaphy/leaphy-webbased-svelte/node_modules/vite-plugin-static-copy/dist/index.js";
import { sentryVitePlugin } from "file:///C:/Users/Jasper/Desktop/Leaphy/leaphy-webbased-svelte/node_modules/@sentry/vite-plugin/dist/esm/index.mjs";
import topLevelAwait from "file:///C:/Users/Jasper/Desktop/Leaphy/leaphy-webbased-svelte/node_modules/vite-plugin-top-level-await/exports/import.mjs";
var __vite_injected_original_dirname = "C:\\Users\\Jasper\\Desktop\\Leaphy\\leaphy-webbased-svelte";
var vite_config_default = defineConfig({
  plugins: [
    svelte(),
    topLevelAwait(),
    viteStaticCopy({
      targets: [
        {
          src: "./node_modules/@leaphy-robotics/leaphy-blocks/media/*",
          dest: "blockly-assets"
        },
        {
          src: "./node_modules/@leaphy-robotics/avrdude-webassembly/avrdude.wasm",
          dest: ""
        },
        {
          src: "./node_modules/@leaphy-robotics/avrdude-webassembly/avrdude-worker.js",
          dest: ""
        },
        {
          src: "./node_modules/@leaphy-robotics/avrdude-webassembly/avrdude.conf",
          dest: ""
        },
        {
          src: "./node_modules/@leaphy-robotics/dfu-util-wasm/build/*",
          dest: "dfu-util"
        },
        {
          src: "./node_modules/@leaphy-robotics/picotool-wasm/build/*",
          dest: "picotool"
        }
      ]
    }),
    // Upload source maps to Sentry
    sentryVitePlugin({
      url: "https://leaphyeasybloqs.com:8443",
      project: "leaphy-webbased-svelte",
      org: "leaphy",
      authToken: process.env.SENTRY_AUTH_TOKEN
    })
  ],
  resolve: {
    alias: {
      $components: path.resolve(__vite_injected_original_dirname, "./src/lib/components"),
      $assets: path.resolve(__vite_injected_original_dirname, "./src/assets"),
      $domain: path.resolve(__vite_injected_original_dirname, "./src/lib/domain"),
      $state: path.resolve(__vite_injected_original_dirname, "./src/lib/state"),
      $examples: path.resolve(__vite_injected_original_dirname, "./src/lib/examples")
    }
  },
  server: {
    headers: {
      "Cross-Origin-Embedder-Policy": "require-corp",
      "Cross-Origin-Opener-Policy": "same-origin"
    }
  },
  build: {
    sourcemap: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxKYXNwZXJcXFxcRGVza3RvcFxcXFxMZWFwaHlcXFxcbGVhcGh5LXdlYmJhc2VkLXN2ZWx0ZVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiQzpcXFxcVXNlcnNcXFxcSmFzcGVyXFxcXERlc2t0b3BcXFxcTGVhcGh5XFxcXGxlYXBoeS13ZWJiYXNlZC1zdmVsdGVcXFxcdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL0M6L1VzZXJzL0phc3Blci9EZXNrdG9wL0xlYXBoeS9sZWFwaHktd2ViYmFzZWQtc3ZlbHRlL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSdcbmltcG9ydCB7IHN2ZWx0ZSB9IGZyb20gJ0BzdmVsdGVqcy92aXRlLXBsdWdpbi1zdmVsdGUnXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJ1xuaW1wb3J0IHsgdml0ZVN0YXRpY0NvcHkgfSBmcm9tICd2aXRlLXBsdWdpbi1zdGF0aWMtY29weSdcbmltcG9ydCB7IHNlbnRyeVZpdGVQbHVnaW4gfSBmcm9tIFwiQHNlbnRyeS92aXRlLXBsdWdpblwiO1xuaW1wb3J0IHRvcExldmVsQXdhaXQgZnJvbSBcInZpdGUtcGx1Z2luLXRvcC1sZXZlbC1hd2FpdFwiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3N2ZWx0ZSgpLCB0b3BMZXZlbEF3YWl0KCksIHZpdGVTdGF0aWNDb3B5KHtcbiAgICB0YXJnZXRzOiBbXG4gICAgICB7XG4gICAgICAgIHNyYzogJy4vbm9kZV9tb2R1bGVzL0BsZWFwaHktcm9ib3RpY3MvbGVhcGh5LWJsb2Nrcy9tZWRpYS8qJyxcbiAgICAgICAgZGVzdDogJ2Jsb2NrbHktYXNzZXRzJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgc3JjOiAnLi9ub2RlX21vZHVsZXMvQGxlYXBoeS1yb2JvdGljcy9hdnJkdWRlLXdlYmFzc2VtYmx5L2F2cmR1ZGUud2FzbScsXG4gICAgICAgIGRlc3Q6ICcnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBzcmM6ICcuL25vZGVfbW9kdWxlcy9AbGVhcGh5LXJvYm90aWNzL2F2cmR1ZGUtd2ViYXNzZW1ibHkvYXZyZHVkZS13b3JrZXIuanMnLFxuICAgICAgICBkZXN0OiAnJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgc3JjOiAnLi9ub2RlX21vZHVsZXMvQGxlYXBoeS1yb2JvdGljcy9hdnJkdWRlLXdlYmFzc2VtYmx5L2F2cmR1ZGUuY29uZicsXG4gICAgICAgIGRlc3Q6ICcnXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBzcmM6IFwiLi9ub2RlX21vZHVsZXMvQGxlYXBoeS1yb2JvdGljcy9kZnUtdXRpbC13YXNtL2J1aWxkLypcIixcbiAgICAgICAgZGVzdDogJ2RmdS11dGlsJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgc3JjOiBcIi4vbm9kZV9tb2R1bGVzL0BsZWFwaHktcm9ib3RpY3MvcGljb3Rvb2wtd2FzbS9idWlsZC8qXCIsXG4gICAgICAgIGRlc3Q6ICdwaWNvdG9vbCdcbiAgICAgIH0sXG4gICAgXVxuICB9KSxcbiAgLy8gVXBsb2FkIHNvdXJjZSBtYXBzIHRvIFNlbnRyeVxuICBzZW50cnlWaXRlUGx1Z2luKHtcbiAgICB1cmw6IFwiaHR0cHM6Ly9sZWFwaHllYXN5YmxvcXMuY29tOjg0NDNcIixcbiAgICBwcm9qZWN0OiBcImxlYXBoeS13ZWJiYXNlZC1zdmVsdGVcIixcbiAgICBvcmc6ICdsZWFwaHknLFxuICAgIGF1dGhUb2tlbjogcHJvY2Vzcy5lbnYuU0VOVFJZX0FVVEhfVE9LRU4sXG4gIH0pXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJGNvbXBvbmVudHM6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuL3NyYy9saWIvY29tcG9uZW50cycpLFxuICAgICAgJGFzc2V0czogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2Fzc2V0cycpLFxuICAgICAgJGRvbWFpbjogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2xpYi9kb21haW4nKSxcbiAgICAgICRzdGF0ZTogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4vc3JjL2xpYi9zdGF0ZScpLFxuICAgICAgJGV4YW1wbGVzOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMvbGliL2V4YW1wbGVzJylcbiAgICB9XG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIGhlYWRlcnM6IHtcbiAgICAgIFwiQ3Jvc3MtT3JpZ2luLUVtYmVkZGVyLVBvbGljeVwiOiBcInJlcXVpcmUtY29ycFwiLFxuICAgICAgXCJDcm9zcy1PcmlnaW4tT3BlbmVyLVBvbGljeVwiOiBcInNhbWUtb3JpZ2luXCJcbiAgICB9XG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgc291cmNlbWFwOiB0cnVlXG4gIH1cbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZWLFNBQVMsb0JBQW9CO0FBQzFYLFNBQVMsY0FBYztBQUN2QixPQUFPLFVBQVU7QUFDakIsU0FBUyxzQkFBc0I7QUFDL0IsU0FBUyx3QkFBd0I7QUFDakMsT0FBTyxtQkFBbUI7QUFMMUIsSUFBTSxtQ0FBbUM7QUFRekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQUMsT0FBTztBQUFBLElBQUcsY0FBYztBQUFBLElBQUcsZUFBZTtBQUFBLE1BQ2xELFNBQVM7QUFBQSxRQUNQO0FBQUEsVUFDRSxLQUFLO0FBQUEsVUFDTCxNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLEtBQUs7QUFBQSxVQUNMLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsS0FBSztBQUFBLFVBQ0wsTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxLQUFLO0FBQUEsVUFDTCxNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLEtBQUs7QUFBQSxVQUNMLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQTtBQUFBLFVBQ0UsS0FBSztBQUFBLFVBQ0wsTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUEsSUFDRixDQUFDO0FBQUE7QUFBQSxJQUVELGlCQUFpQjtBQUFBLE1BQ2YsS0FBSztBQUFBLE1BQ0wsU0FBUztBQUFBLE1BQ1QsS0FBSztBQUFBLE1BQ0wsV0FBVyxRQUFRLElBQUk7QUFBQSxJQUN6QixDQUFDO0FBQUEsRUFDRDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsYUFBYSxLQUFLLFFBQVEsa0NBQVcsc0JBQXNCO0FBQUEsTUFDM0QsU0FBUyxLQUFLLFFBQVEsa0NBQVcsY0FBYztBQUFBLE1BQy9DLFNBQVMsS0FBSyxRQUFRLGtDQUFXLGtCQUFrQjtBQUFBLE1BQ25ELFFBQVEsS0FBSyxRQUFRLGtDQUFXLGlCQUFpQjtBQUFBLE1BQ2pELFdBQVcsS0FBSyxRQUFRLGtDQUFXLG9CQUFvQjtBQUFBLElBQ3pEO0FBQUEsRUFDRjtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sU0FBUztBQUFBLE1BQ1AsZ0NBQWdDO0FBQUEsTUFDaEMsOEJBQThCO0FBQUEsSUFDaEM7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxXQUFXO0FBQUEsRUFDYjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
