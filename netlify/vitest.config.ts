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
        // Línea base medida 2026-08-04 con Node 20 + pnpm 10.14.0:
        // líneas 52.59 / ramas 91.66 / funciones 74.07.
        // 5 handlers y 2 utils sin pruebas (0%) → deuda para subir progresivamente.
        lines: 50,
        functions: 60,
        branches: 80,
      },
    },
  },
});