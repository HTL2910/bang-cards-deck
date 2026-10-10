import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  server: {
    watch: {
      usePolling: true,
    },
  },
  test: {
    environment: "jsdom",
    exclude: [...configDefaults.exclude, "**/.worktrees/**"],
    setupFiles: ["./vitest.setup.ts"],
  },
});
