import { build } from "./esbuild.common.mjs";

await build({
    sourcemap: true,
    minifyIdentifiers: false,
    bundle: false,
    minify: false
});