import axios from "axios";
import { load } from "cheerio";

import type { Categories } from "../../companiesTable/types";
import { mapCaeToCategory } from "../caeMapper";

export const findCategory = async (nif: string): Promise<Categories | undefined> => {
  const response = await axios.get(
    `https://www.einforma.pt/servlet/app/portal/ENTP/prod/ETIQUETA_EMPRESA_CONTRIBUINTE/nif/${nif}/contribuinte/${nif}/`,
    {
      responseType: "text",
      validateStatus: null
    }
  );

  const $ = load(response.data);

  const caeText: string = $(
    "#presentacion > div:nth-child(1) > div.col-one > div.mod-datos > div.vcard > table > tbody > tr:nth-child(6) > td:nth-child(2) > span > a"
  )?.text();
  const cae = caeText?.split(" - ")?.[0];

  if (!cae) {
    return undefined;
  }

  return mapCaeToCategory(Number(cae));
};
