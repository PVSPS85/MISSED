import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';

export default defineConfig({
  base: '',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '../frontend/src'),
      '@shared': path.resolve(import.meta.dirname, '../shared/src'),
    },
  },
  build: {
    outDir: 'build',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(import.meta.dirname, 'popup.html'),
        sidepanel: path.resolve(import.meta.dirname, 'sidepanel.html'),
        background: path.resolve(import.meta.dirname, 'src/background.ts'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  }
});
