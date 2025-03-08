import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "happy-dom",
    globals: true,
  },
  define: {
    "import.meta.env.DEBUG": JSON.stringify(process.env.DEBUG || ""),
  },
});
