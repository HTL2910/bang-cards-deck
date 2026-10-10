import { defineConfig } from "vitest/config";

export default defineConfig({
  server: {
    watch: {
      usePolling: true,
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
  },
});
