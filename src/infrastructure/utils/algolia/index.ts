import type { SaveObjectResponse, SearchResponses } from "@algolia/client-search";
import { algoliasearch } from "algoliasearch";

const client = algoliasearch("YourApplicationID", "YourAdminAPIKey");

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
