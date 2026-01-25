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
    packages: "external",
    external: ["chromium-bidi", "chromium-bidi/*"],
    banner: {
      js: `
        import { createRequire } from 'node:module';
        import { fileURLToPath } from 'node:url';
        import { dirname } from 'node:path';
        
        const require = createRequire(import.meta.url);
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
      `
    }
  })
  .catch(() => process.exit(1)); // Exit on error
