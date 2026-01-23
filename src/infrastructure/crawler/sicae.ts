import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";

import type { Categories } from "../nifCategoryTable/types";
import { mapCaeToCategory } from "./caeMapper";

interface SiCAEData {
  cae: string;
  cae2: string[];
}

const parseRowData = (): SiCAEData => {};

export const findCategory = async (nif: string): Promise<Categories | undefined> => {
  const isLambda = !!process.env.AWS_LAMBDA_FUNCTION_NAME;

  const launchOptions = isLambda
    ? {
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true
      }
    : {
        headless: true
      };

  const browser = await playwrightChromium.launch(launchOptions);

  const page = await browser.newPage();
  page.on("console", msg => {
    console.log("BROWSER LOG:", msg.text());
  });

  await page.goto("http://www.sicae.pt/Consulta.aspx");

  await page.fill("#ctl00_MainContent_ipNipc", nif);
  await page.click("#ctl00_MainContent_btnPesquisa");

  // wait for CAE text to appear
  const validNifResults = page.waitForSelector('td:has-text("CAE Principal")', {
    timeout: 2000
  });

  const invalidNif = page.waitForSelector("#ctl00_MainContent_lblError", { timeout: 2000 });

  const element = await Promise.race([validNifResults, invalidNif]);

  const elementText = await element.textContent();

  let cae: string | undefined = undefined;

  if (elementText?.includes("CAE Principal")) {
    const result = await page.evaluate((): SiCAEData | undefined => {
      // This code runs inside the browser so document will always be defined
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
        cae: cells[2]?.textContent?.trim(),
        cae2:
          cells[3]?.textContent
            ?.trim()
            .replace(/\n*\s*/g, "")
            .split(",") ?? []
      };
    });

    cae = result!.cae;
  }
  await browser.close();

  if (cae) {
    return mapCaeToCategory(cae);
  }
  return undefined;
};

(async () => {
  console.log(await findCategory("515198374"));
})();
