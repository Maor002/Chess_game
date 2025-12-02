// vite.config.js (place in project root, same level as "frontend")
import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.resolve(__dirname, 'frontend/'), // Serve HTML from here

  server: {
    port: 5173,
    open: false,                    // Auto-open browser
    strictPort: true,
  },

  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'frontend'),
      '@js': path.resolve(__dirname, 'frontend/js'),
      '@css': path.resolve(__dirname, 'frontend/css'),
      '@backend': path.resolve(__dirname, 'backend/src'),
      '@html': path.resolve(__dirname, 'frontend/html'),
      '@assets': path.resolve(__dirname, 'frontend/assets'),
      '@engine': path.resolve(__dirname, 'frontend/js/engine'),
      '@ui': path.resolve(__dirname, 'frontend/js/ui'),
      '@service': path.resolve(__dirname, 'frontend/js/service'),
      '@logger': path.resolve(__dirname, 'frontend/js/logger'),
      '@language': path.resolve(__dirname, 'frontend/js/language'),
    },
  },

  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        board: path.resolve(__dirname, 'frontend/html/Board.html'),
        menu: path.resolve(__dirname, 'frontend/index.html'),
      },
    },
  },
});