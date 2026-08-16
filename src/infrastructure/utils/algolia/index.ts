import type { UpdatedAtWithObjectIdResponse } from "@algolia/client-search";
import { algoliasearch } from "algoliasearch";
import type { SearchResult } from "algoliasearch/lite";
import { getEnvironmentVariable } from "../getEnvironmentVariable";

const client = algoliasearch(
  getEnvironmentVariable("ALGOLIA_APPLICATION_ID"),
  getEnvironmentVariable("ALGOLIA_WRITE_API_KEY")
);

/**
 * Saves object in specified index
 * @param {string} indexName - Index name
 * @param {string} objectID - Object id
 * @param {T} item - Item to save
 */
export const saveObject = async <T>(
  indexName: string,
  objectID: string,
  item: T
): Promise<UpdatedAtWithObjectIdResponse> =>
  await client.addOrUpdateObject({
    body: item as object,
    objectID,
    indexName
  });

/**
 * Search objects in specified index
 * @param {string} indexName - Index name
 * @param {string} query - Query string
 * @param {number | undefined} page - Page number
 */
export const searchObjects = async <T>(
  indexName: string,
  query: string,
  page: number | undefined
): Promise<SearchResult<T>> => {
  const response = await client.search({
    requests: [
      {
        indexName,
        query: query,
        page
      }
    ]
  });
  return response.results[0];
};
