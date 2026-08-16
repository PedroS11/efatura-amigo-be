import type { SearchResponse } from "algoliasearch/lite";
import type { Company } from "../companiesTable/types";
import { saveObject, searchObjects } from "../utils/algolia";
import { getEnvironmentVariable } from "../utils/getEnvironmentVariable";

const companiesIndex = getEnvironmentVariable("ALGOLIA_COMPANIES_INDEX");

export const searchCompanies = async (query: string, page: number | undefined): Promise<Company[]> => {
  const response: SearchResponse<Company> = (await searchObjects<Company>(
    companiesIndex,
    query,
    page
  )) as SearchResponse<Company>;

  return response.hits;
};

export const saveCompanyInAlgolia = async (company: Company): Promise<void> => {
  await saveObject(companiesIndex, company.nif.toString(), company);
};
