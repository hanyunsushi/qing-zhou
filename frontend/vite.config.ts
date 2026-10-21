import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'
import { microfrontendCssScopePlugin } from './scripts/microfrontend-css-scope.mjs'

const microfrontendBuild = process.env.QZ_MICROFRONTEND === '1'

export default defineConfig({
  define: microfrontendBuild ? {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'import.meta.env.QZ_MICROFRONTEND': true,
  } : {},
  base: microfrontendBuild ? (process.env.CONSOLE_MFE_ASSET_BASE || '/apps/kreeproxy/microfrontend/') : '/',
  plugins: [vue(), ...(microfrontendBuild ? [microfrontendCssScopePlugin('kreeproxy')] : [])],
  // The normal build remains the standalone Kreeproxy SPA. Set QZ_MICROFRONTEND=1
  // to produce the independently consumable mount() entry for Console.
  build: microfrontendBuild
    ? {
        lib: {
          entry: fileURLToPath(new URL('./src/runtime/microfrontend.ts', import.meta.url)),
          formats: ['es'],
          fileName: () => 'kreeproxy-microfrontend.js',
        },
        outDir: process.env.CONSOLE_MFE_OUT_DIR || 'dist/microfrontend',
        emptyOutDir: true,
      }
    : {
        outDir: 'dist',
        emptyOutDir: true,
      },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // Proxy to the panel's default QZ_LISTEN (see start.ps1 / deploy env), so
    // `npm run dev` talks to a locally running backend out of the box.
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
      },
      '/sub': {
        target: 'http://127.0.0.1:8081',
        changeOrigin: true,
      },
    },
  },
})
