import type { SaveObjectResponse, SearchResponses } from "@algolia/client-search";
import { algoliasearch } from "algoliasearch";
import { getEnvironmentVariable } from "../getEnvironmentVariable";

const client = algoliasearch(
  getEnvironmentVariable("ALGOLIA_APPLICATION_ID"),
  getEnvironmentVariable("ALGOLIA_WRITE_API_KEY")
);

export const saveObject = async <T>(indexName: string, item: T): Promise<SaveObjectResponse> =>
  await client.saveObject({
    body: item as object,
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
