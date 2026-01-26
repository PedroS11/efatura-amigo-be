import { BatchWriteCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { getEnvironmentVariable } from "../utils/getEnvironmentVariable";
import { getDynamoInstance } from "./service";
import type { UnprocessedCompany } from "./types";

const UNPROCESSED_COMPANIES_TABLE = getEnvironmentVariable("UNPROCESSED_COMPANIES_TABLE");

/**
 * Get category by NIF
 * @param {number} nif - Nif
 */
export const getUnprocessedCompany = async (limit: number): Promise<UnprocessedCompany[]> => {
  const db = getDynamoInstance();

  const result = await db.send(
    new QueryCommand({
      TableName: UNPROCESSED_COMPANIES_TABLE,
      Limit: limit
    })
  );

  return result.Items as UnprocessedCompany[];
};

export const deleteBatch = async (nifs: number[]) => {
  const db = getDynamoInstance();

  const deleteRequests = nifs.map(nif => ({
    DeleteRequest: {
      Key: {
        nif
      }
    }
  }));

  await db.send(
    new BatchWriteCommand({
      RequestItems: {
        [UNPROCESSED_COMPANIES_TABLE]: deleteRequests
      }
    })
  );
};

export const addCompany = async (nif: number) => {
  const db = getDynamoInstance();

  const item: UnprocessedCompany = {
    nif,
    timestamp: Date.now()
  };

  await db.send(
    new PutCommand({
      TableName: UNPROCESSED_COMPANIES_TABLE,
      Item: item
    })
  );
};
