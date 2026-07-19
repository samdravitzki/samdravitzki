import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    silent: "passed-only",
    environment: "jsdom",
    coverage: {
      enabled: true,
      provider: "v8",
    },
  },
});
