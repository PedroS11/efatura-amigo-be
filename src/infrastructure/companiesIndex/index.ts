import type { Hit, SearchResponse } from "algoliasearch/lite";
import { Categories, type Company } from "../companiesTable/types";
import { saveObject, searchObjects } from "../utils/algolia";
import { getEnvironmentVariable } from "../utils/getEnvironmentVariable";
import type { SearchCompaniesResponse, SearchedCompany } from "./types";

const companiesIndex = getEnvironmentVariable("ALGOLIA_COMPANIES_INDEX");

/**
 * Search companies in Algolia
 * @param {string} query - Query string
 * @param {number | undefined} page - Page number
 */
export const searchCompanies = async (query: string, page: number | undefined): Promise<SearchCompaniesResponse> => {
  const response: SearchResponse<Company> = (await searchObjects<Company>(
    companiesIndex,
    query,
    page
  )) as SearchResponse<Company>;

  return {
    items: response.hits.map(
      ({ _highlightResult, objectID, ...hit }: Hit<Company>): SearchedCompany => ({
        ...hit,
        category: hit.category ? Categories[hit.category] : undefined
      })
    ),
    page: response.page!,
    nrHits: response.nbHits!,
    nrPages: response.nbPages!
  };
};

/**
 * Saves company item in Algolia
 * @param {Company} company - Company object
 */
export const saveCompanyInAlgolia = async (company: Company): Promise<void> => {
  await saveObject(companiesIndex, company.nif.toString(), company);
};
