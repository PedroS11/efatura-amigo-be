import * as cheerio from "cheerio";
import type { Element } from "domhandler";
import { sendMessage } from "../telegramBot";
import { logError } from "../utils/logger";

const URL = "http://www.sicae.pt/Consulta.aspx";
const UA = "Mozilla/5.0";

interface Cae {
  codigo: string;
  descricao: string;
}

interface SicaeCompany {
  nipc: string;
  nome: string;
  caePrincipal: Cae | undefined;
  caesSecundarios: Cae[];
}

const parseCae = ($: cheerio.CheerioAPI, div: Element): Cae => ({
  // Secondary CAES are return with a comma ("49330,"), so strip every non digit character
  codigo: $(div).text().replace(/\D/g, ""),
  descricao: $(div).attr("title") ?? ""
});

function parseResults(html: string): SicaeCompany[] {
  const $ = cheerio.load(html);

  return $("#ctl00_MainContent_ConsultaDataGrid tr")
    .not(".gridHeader")
    .map((_, tr) => {
      const tds = $(tr).children("td");

      return {
        nipc: tds.eq(0).text().trim(),
        nome: tds.eq(1).text().trim(),
        caePrincipal: tds
          .eq(2)
          .find("div")
          .map((_, d) => parseCae($, d))
          .get()?.[0],
        caesSecundarios: tds
          .eq(3)
          .find("div")
          .map((_, d) => parseCae($, d))
          .get()
      };
    })
    .get();
}

const searchByNif = async (nif: number): Promise<string> => {
  const getRes = await fetch(URL, {
    headers: { "User-Agent": UA },
    signal: AbortSignal.timeout(15_000)
  });

  const cookies = getRes.headers
    .getSetCookie()
    .map(c => c.split(";")[0])
    .join("; ");

  const $form = cheerio.load(await getRes.text());
  const data = new URLSearchParams();

  $form("input[type=hidden]").each((_, el) => {
    const name = $form(el).attr("name");
    if (name) data.set(name, $form(el).attr("value") ?? "");
  });

  data.set("ctl00$MainContent$ipFirma", "");
  data.set("ctl00$MainContent$ipNipc", nif.toString());
  data.set("ctl00$MainContent$ipCae", "");
  data.set("ctl00$MainContent$btnPesquisa", "Pesquisar");

  const postRes = await fetch(URL, {
    method: "POST",
    headers: {
      "User-Agent": UA,
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookies
    },
    body: data,
    signal: AbortSignal.timeout(15_000)
  });

  return await postRes.text();
};

export async function searchSicaeCompany(nif: number): Promise<SicaeCompany | undefined> {
  try {
    const html = await searchByNif(nif);
    const results = parseResults(html);

    // The website returns always a table but since I only search one NIF at the time,
    // I just need the first result if exists
    if (results.length) {
      const company = results[0];
      if (!company?.nome || !company?.caePrincipal?.codigo) {
        logError(`Error parsing results from ${nif}`, company);

        throw new Error(`Error parsing results from ${nif}`);
      }
      return results[0];
    }
    return;
  } catch (e) {
    const error = e as Error;

    logError(`Error calling SICAE with NIF: ${nif}`, error.message);
    await sendMessage(`Error calling SICAE with NIF: ${nif}, error: ${(error as Error).message}`);

    return;
  }
}
