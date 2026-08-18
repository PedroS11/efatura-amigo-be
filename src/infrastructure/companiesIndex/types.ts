import type { Company } from "../companiesTable/types";

export type SearchedCompany = Omit<Company, "category"> & {
  category?: string;
};

export type SearchCompaniesResponse = {
  items: SearchedCompany[];
  page: number;
  nrHits: number;
  nrPages: number;
};
