import { execSync } from "child_process";
import { mkdirSync, rmSync, writeFileSync } from "fs";

const LAYER_DIR = "layers/chromium";
const NODEJS_DIR = `${LAYER_DIR}/nodejs`;

// Clean and create layer directory structure
rmSync(LAYER_DIR, { recursive: true, force: true });
mkdirSync(NODEJS_DIR, { recursive: true });

// Create a minimal package.json for the layer
const layerPackageJson = {
  name: "chromium-layer",
  version: "1.0.0",
  dependencies: {
    "@sparticuz/chromium": "^143.0.4"
  }
};

writeFileSync(
  `${NODEJS_DIR}/package.json`,
  JSON.stringify(layerPackageJson, null, 2)
);

// Install dependencies using npm (resolves all transitive deps)
console.log("Installing @sparticuz/chromium and dependencies...");
execSync("npm install --omit=dev --ignore-scripts", {
  cwd: NODEJS_DIR,
  stdio: "inherit"
});

// Clean up package files (not needed in layer)
rmSync(`${NODEJS_DIR}/package.json`);
rmSync(`${NODEJS_DIR}/package-lock.json`, { force: true });

console.log("\nChromium layer built successfully!");

