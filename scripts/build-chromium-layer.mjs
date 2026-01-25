import { cpSync, mkdirSync, rmSync } from "fs";

const LAYER_DIR = "layers/chromium";

// Clean and create layer directory structure
rmSync(LAYER_DIR, { recursive: true, force: true });
mkdirSync(`${LAYER_DIR}/nodejs/node_modules/@sparticuz`, { recursive: true });

// Copy @sparticuz/chromium to layer
cpSync(
  "node_modules/@sparticuz/chromium",
  `${LAYER_DIR}/nodejs/node_modules/@sparticuz/chromium`,
  { recursive: true }
);

console.log("Chromium layer built successfully!");

