import chromium_lambda from "@sparticuz/chromium";
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

export const getLaunchOptions = async (): Promise<LaunchOptions> => {
  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  if (!isLambda) {
    return { headless: true };
  }

  return {
    args: [
      ...chromium_lambda.args,
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--single-process", // Highly recommended for ETXTBSY issues
      "--no-zygote",
      "--disable-dev-shm-usage", // Uses /tmp instead of shared memory
      "--disable-gpu" // No need for GPU in headless Lambda
    ],
    executablePath: await chromium_lambda.executablePath(),
    headless: true
  };
};
