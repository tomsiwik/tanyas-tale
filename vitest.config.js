import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    browser: {
      provider: "playwright",
      enabled: true,
      instances: [{ browser: "chromium" }],
      headless: true,
      screenshot: false,
      screenshotFailures: false,
    },
    include: ["src/**/*.{test,spec}.{js,ts}"],
    exclude: ["**/*.unit.test.js"],
    environment: "happy-dom",
    globals: true,
    setupFiles: ["src/test/setup.js"],
    testTimeout: 10000,
    hookTimeout: 10000,
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
