import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  root: __dirname,
  css: {
    postcss: {},
  },
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 25000,
    hookTimeout: 25000,
    fileParallelism: false,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
