import esbuild from "esbuild";

// Create the esbuild build configuration
esbuild
  .build({
    entryPoints: ["src/application/**/*.ts"],
    bundle: true,
    format: "esm",
    outdir: "dist",
    sourcemap: true,
    minify: true,
    outExtension: { ".js": ".mjs" },
    target: "node22",
    platform: "node",
    external: ["@aws-sdk/*"],
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
  .catch(() => process.exit(1));
