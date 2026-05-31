import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react({
      // Включаем поддержку JSX в .js файлах
      jsxRuntime: 'automatic',
      jsxImportSource: 'react',
      include: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    })
  ],
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true,
    },
  },
  build: {
    outDir: 'build',
  },
});