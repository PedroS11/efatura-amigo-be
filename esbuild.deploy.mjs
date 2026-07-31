import { build } from "./esbuild.common.mjs";

await build({
    sourcemap: false,
    minifyIdentifiers: false,
    bundle: true,
    minify: true
});