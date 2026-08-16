import type { SearchResponses, UpdatedAtWithObjectIdResponse } from "@algolia/client-search";
import { algoliasearch } from "algoliasearch";
import { getEnvironmentVariable } from "../getEnvironmentVariable";

const client = algoliasearch(
  getEnvironmentVariable("ALGOLIA_APPLICATION_ID"),
  getEnvironmentVariable("ALGOLIA_WRITE_API_KEY")
);

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

export const searchObjects = async <T>(indexName: string, query: string): Promise<SearchResponses<T>> =>
  await client.search({
    requests: [
      {
        indexName,
        query: query
      }
    ]
  });
