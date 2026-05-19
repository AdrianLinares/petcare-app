import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['**/*.ts'],
      exclude: ['node_modules/', 'test/', 'vitest.config.ts'],
      thresholds: {
        lines: 70,
        functions: 60,
        branches: 60,
      },
    },
  },
});