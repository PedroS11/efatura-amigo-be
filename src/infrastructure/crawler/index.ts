import type { Categories } from "../nifCategoryTable/types";
import { mapCaeToCategory } from "./caeMapper";
import { findCompany } from "./sicae";

export interface CrawledData {
  nif: number;
  name: string;
  cae: number;
  category: Categories | undefined;
}

export const crawlCompany = async (nif: number): Promise<CrawledData | undefined> => {
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
