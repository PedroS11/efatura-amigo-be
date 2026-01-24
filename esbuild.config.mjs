import esbuild from "esbuild";

// Create the esbuild build configuration
esbuild
  .build({
    entryPoints: ["src/application/**/*.ts"], // Main entry point (change as needed)
    bundle: true, // Enable bundling
    format: "esm",
    outdir: "dist", // Output file
    sourcemap: true, // Generate sourcemaps
    minify: true, // Minify the output for production
    outExtension: { ".js": ".mjs" },
    target: "node22",
    platform: "node",
    external: ["chromium-bidi", "chromium-bidi/*"]
  })
  .catch(() => process.exit(1)); // Exit on error
