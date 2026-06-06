import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      bullmq: new URL("./test/mocks/bullmq.js", import.meta.url).pathname,
      ioredis: new URL("./test/mocks/ioredis.js", import.meta.url).pathname,
    },
  },
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./test/setup/env.js"],
    include: ["test/**/*.test.js"],
    hookTimeout: 120000,
    testTimeout: 120000,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      reportsDirectory: "./coverage",
    },
  },
});
