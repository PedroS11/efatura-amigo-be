import type { Categories } from "../nifCategoryTable/types";
import { mapCaeToCategory } from "./caeMapper";
import { findCompany } from "./sicae";

export interface CrawledData {
  nif: string;
  name: string;
  cae: string;
  category: Categories | undefined;
}

export const crawlCompany = async (nif: string): Promise<CrawledData | undefined> => {
  const company = await findCompany(nif);
  if (company) {
    const { nif, name, cae } = company;

    return {
      name,
      category: mapCaeToCategory(cae),
      nif,
      cae
    };
  }

  return;
};

(async () => {
  console.log(await crawlCompany("515198374"));
})();
