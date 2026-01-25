import chromium from "@sparticuz/chromium";
import { accessSync, constants } from "fs";
import type { LaunchOptions, Page } from "playwright-core";

import type { SiCAEData } from "./types";

export const parseResultsTable = async (page: Page): Promise<SiCAEData | undefined> =>
  await page.evaluate((): SiCAEData | undefined => {
    // This code runs inside the browser so document will always be defined
    // @ts-ignore
    const table = document.querySelector("#ctl00_MainContent_ConsultaDataGrid");
    if (!table) {
      return;
    }

    const firstRow = table.querySelector("tr:nth-child(2)");
    if (!firstRow) {
      return;
    }

    const cells = firstRow.querySelectorAll("td");

    return {
      nif: Number(cells[0]?.textContent?.trim()),
      name: cells[1]?.textContent?.trim(),
      cae: Number(cells[2]?.textContent?.trim()),
      cae2: cells[3]?.textContent
        ?.trim()
        .replace(/\n*\s*/g, "")
        .split(",")
        .map(Number)
        .filter(Boolean)
    };
  });

// Wait for file to be executable (extraction complete)
const waitForExecutable = async (path: string, maxAttempts = 10): Promise<void> => {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      accessSync(path, constants.X_OK);
      return; // File is executable
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  throw new Error(`Chromium binary not executable after ${maxAttempts} attempts`);
};

export const getLaunchOptions = async (): Promise<LaunchOptions> => {
  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (!isLambda) {
    return { headless: true };
  }

  // Get executable path (triggers extraction)
  const executablePath = await chromium.executablePath();

  // Wait for the binary to be fully extracted and executable
  await waitForExecutable(executablePath);

  return {
    args: chromium.args,
    executablePath,
    headless: true
  };
};
