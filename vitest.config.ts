import { defineConfig } from "vitest/config";
import { config } from "dotenv";

const env = config({ path: ".env.test" });

export default defineConfig({
  test: {
    globals: true,
    include: ["./src/**/*.spec.ts"],
    environment: "node",
    env: env.parsed,
    coverage: {
      include: ["src/*"],
      provider: "v8"
    }
  }
});
