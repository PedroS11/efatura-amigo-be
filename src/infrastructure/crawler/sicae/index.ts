import { launchChromium } from "playwright-aws-lambda";

import { INVALID_NIF_MESSAGE_ID, NIF_INPUT_ID, SEARCH_BUTTON_ID, SICAE_URL, VALID_NIF_TABLE_ID } from "./constants";
import { parseResultsTable } from "./helpers";
import type { SiCAEData } from "./types";

export const findCompany = async (nif: number): Promise<SiCAEData | undefined> => {
  const browser = await launchChromium();
  const context = await browser.newContext();

  const page = await context.newPage();
  page.on("console", msg => {
    console.log("BROWSER LOG:", msg.text());
  });

  await page.goto(SICAE_URL);

  await page.fill(NIF_INPUT_ID, nif.toString());
  await page.click(SEARCH_BUTTON_ID);

  const validNifSelector = page.waitForSelector(VALID_NIF_TABLE_ID, {
    timeout: 2000
  });
  const invalidNifSelector = page.waitForSelector(INVALID_NIF_MESSAGE_ID, { timeout: 2000 });

  const successfulSelector = await Promise.race([validNifSelector, invalidNifSelector]);
  const successfulSelectorText = await successfulSelector.textContent();

  let result: SiCAEData | undefined = undefined;

  if (successfulSelectorText?.includes("CAE Principal")) {
    result = await parseResultsTable(page);
  }

  await browser.close();

  return result;
};

(async () => {
  console.log(await findCompany(515198374));
})();
