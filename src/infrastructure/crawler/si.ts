import chromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";

async function getCae(nif: string) {
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

  console.log("The first element that appeared:", await element.textContent());

  // extract only first row of the known table
  const result = await page.evaluate(() => {
    const table = document.querySelector<HTMLTableElement>("#ctl00_MainContent_ConsultaDataGrid");
    if (!table) return {};

    const firstRow = table.querySelector<HTMLTableRowElement>("tr:nth-child(2)");
    if (!firstRow) return {};

    const cells = firstRow.querySelectorAll<HTMLTableCellElement>("td");

    console.log("C", cells);

    return {
      CAE: cells[2]?.textContent?.trim() ?? null,
      "CAE-2":
        cells[3]?.textContent
          ?.trim()
          .replace(/\n*\s*/g, "")
          .split(",") ?? []
    };
  });

  await browser.close();
  return result;
}
(async () => {
  console.log(await getCae("515198374"));
})();
