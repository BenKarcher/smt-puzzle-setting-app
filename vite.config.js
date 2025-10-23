import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'fs';
import path from 'path';

// Small plugin: copy minizinc.wasm and minizinc.data from the installed
// `minizinc` package into the build `assets` directory. The minizinc
// web worker expects these files to be colocated with the worker JS, and
// without this copy they were missing from `dist/assets` causing 404s on
// GitHub Pages.
function copyMiniZincAssets() {
  let outDir = 'dist';
  return {
    name: 'copy-minizinc-wasm',
    apply: 'build',
    configResolved(resolvedConfig) {
      outDir = resolvedConfig.build.outDir || outDir;
    },
    async writeBundle() {
      try {
        const srcDir = path.resolve(process.cwd(), 'node_modules', 'minizinc', 'dist');
        const destDir = path.resolve(process.cwd(), outDir, 'assets');
        fs.mkdirSync(destDir, { recursive: true });
        for (const fileName of ['minizinc.wasm', 'minizinc.data']) {
          const src = path.join(srcDir, fileName);
          const dest = path.join(destDir, fileName);
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
          }
        }
      } catch (e) {
        console.error('copy-minizinc-wasm plugin failed:', e);
      }
    }
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [svelte(), copyMiniZincAssets()],
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
