import type { Page } from "playwright-core";

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
