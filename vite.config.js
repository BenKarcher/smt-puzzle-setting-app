import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig(({mode}) => ({
  plugins: [svelte()],
  base: mode === 'production' ? '/smt-puzzle-setting-app/' : '/',
  optimizeDeps: {
    exclude: ['minizinc']
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
}));
