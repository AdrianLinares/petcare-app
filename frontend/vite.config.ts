import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "i18next": path.resolve(__dirname, "./src/test/mocks/i18next.ts"),
      "react-i18next": path.resolve(__dirname, "./src/test/mocks/react-i18next.ts"),
      "i18next-browser-languagedetector": path.resolve(
        __dirname,
        "./src/test/mocks/i18next-browser-languagedetector.ts"
      ),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-accordion'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
}));
