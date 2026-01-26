import { stringify } from "node:querystring";

import axios from "axios";
import { load } from "cheerio";

async function searchNIF(nif: string): Promise<void> {
  const url = "https://webinq.ine.pt/public/pages/queryCae";

  // 1. Get the page to extract current ViewState
  const getRes = await axios.get(url);
  const $ = load(getRes.data);

  const viewState = $("#__VIEWSTATE").val();
  const generator = $("#__VIEWSTATEGENERATOR").val();

  // 2. Post the form with the extracted tokens
  const postData = stringify({
    __VIEWSTATE: viewState,
    __VIEWSTATEGENERATOR: generator,
    ctl00$contentBody$txtNif: nif,
    ctl00$contentBody$txtNome: "",
    ctl00$contentBody$btPesquisar: "Pesquisar"
  });

  console.log(postData);
  const postRes = await axios.post(url, postData, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Referer: url
    }
  });

  console.log("Results HTML received!");
  console.log(postRes.data);
  // Now you can parse postRes.data for the company info
}

(async () => {
  try {
    await searchNIF("515198374");
  } catch (error) {
    console.log(error);
  }
})();
