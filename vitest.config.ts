import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/__tests__/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@shared': '/src/shared',
      '@extension': '/src/extension',
    },
  },
});
