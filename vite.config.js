import { defineConfig } from "vite";
import checker from "vite-plugin-checker";

export default defineConfig({
  test: {
    environment: "jsdom",
    coverage: {
      enabled: true,
      provider: "v8",
    },
  },
  plugins: [
    checker({
      typescript: true,
    }),
  ],
});
