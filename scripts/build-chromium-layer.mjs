import { cpSync, mkdirSync, rmSync } from "fs";

const LAYER_DIR = "layers/chromium";
const NODE_MODULES = `${LAYER_DIR}/nodejs/node_modules`;

// Clean and create layer directory structure
rmSync(LAYER_DIR, { recursive: true, force: true });
mkdirSync(NODE_MODULES, { recursive: true });

// Packages to include in the layer
// @sparticuz/chromium and its dependencies
const packages = [
  "@sparticuz/chromium",
  "follow-redirects",
  "tar-fs",
  "tar-stream",
  "streamx",
  "fast-fifo",
  "queue-tick",
  "text-decoder",
  "b4a",
  "bare-events"
];

for (const pkg of packages) {
  const src = `node_modules/${pkg}`;
  const dest = `${NODE_MODULES}/${pkg}`;
  try {
    cpSync(src, dest, { recursive: true });
    console.log(`Copied ${pkg}`);
  } catch (e) {
    // Some packages might not exist (optional deps)
    console.log(`Skipped ${pkg} (not found)`);
  }
}

console.log("\nChromium layer built successfully!");

