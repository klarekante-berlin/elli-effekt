import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: resolve(__dirname, 'src'),
  server: {
    host: true, // 0.0.0.0
    port: 4000,
    strictPort: true,
    hmr: {
      host: 'localhost'
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html')
      }
    }
  },
  css: {
    postcss: './postcss.config.js',
  },
});
