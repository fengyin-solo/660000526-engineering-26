/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// 独立于 vite.config.ts 的回归测试配置，不影响 dev / build
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  define: {
    global: 'globalThis',
  },
  cacheDir: 'regression/.artifacts/.vite',
  test: {
    include: ['regression/suites/**/*.test.{ts,tsx}'],
    environment: 'jsdom',
    setupFiles: ['regression/setup.ts'],
    reporters: [
      'default',
      [fileURLToPath(new URL('./regression/lib/regressionReporter.ts', import.meta.url)), {}],
    ],
    pool: 'threads',
    hookTimeout: 20000,
    testTimeout: 15000,
  },
});
