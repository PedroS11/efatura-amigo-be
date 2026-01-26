import { BatchGetCommand, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import { getEnvironmentVariable } from "../utils/getEnvironmentVariable";
import { getDynamoInstance } from "./service";
import type { Categories, Company } from "./types";

const COMPANIES_TABLE = getEnvironmentVariable("COMPANIES_TABLE");
/**
 * Get category by NIF
 * @param {number} nif - Nif
 */
export const getCategory = async (nif: number): Promise<Categories | undefined> => {
  const db = getDynamoInstance();

  const result = await db.send(
    new GetCommand({
      TableName: COMPANIES_TABLE,
      Key: {
        nif
      }
    })
  );

  const row = result.Item as Company | undefined;

  return row?.category;
};

export const saveCompany = async (nif: number, name: string, category: Categories): Promise<void> => {
  const db = getDynamoInstance();
  const item: Company = {
    category,
    name,
    nif
  };

  await db.send(
    new PutCommand({
      TableName: COMPANIES_TABLE,
      Item: item
    })
  );
};

export const getExistingNifsFromList = async (nifs: number[]): Promise<Company["nif"][]> => {
  const db = getDynamoInstance();

  const existingNifs: number[] = [];

  let requestItems = {
    RequestItems: {
      [COMPANIES_TABLE]: {
        Keys: nifs.map(nif => ({ nif })),
        ProjectionExpression: "nif"
      }
    }
  };

  let retries = 0;

  do {
    const result = await db.send(new BatchGetCommand(requestItems));

    const companies = (result.Responses?.[COMPANIES_TABLE] ?? []) as Company[];
    existingNifs.push(...companies.map(company => company.nif));

    // Only retry if there are unprocessed keys
    if (Object.keys(result.UnprocessedKeys ?? {}).length > 0) {
      const unprocessed: typeof requestItems.RequestItems = {};

      for (const tableName in result.UnprocessedKeys) {
        unprocessed[tableName] = {
          Keys: result.UnprocessedKeys[tableName].Keys as { nif: number }[],
          ProjectionExpression: "nif"
        };
      }

      requestItems = { RequestItems: unprocessed };
      retries++;

      // Small delay to avoid throttling
      await new Promise(res => setTimeout(res, 50));
    } else {
      // No unprocessed keys, stop retrying
      break;
    }
  } while (retries < 3);

  return existingNifs;
};
