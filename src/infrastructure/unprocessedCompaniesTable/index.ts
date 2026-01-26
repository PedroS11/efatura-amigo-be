import { BatchWriteCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import { getDynamoInstance } from "./service";
import type { UnprocessedCompany } from "./types";

/**
 * Get category by NIF
 * @param {number} nif - Nif
 */
export const getUnprocessedCompany = async (limit: number): Promise<UnprocessedCompany[]> => {
  const db = getDynamoInstance();

  const result = await db.send(
    new QueryCommand({
      TableName: process.env.UNPROCESSED_COMPANIES_TABLE,
      Limit: limit
    })
  );

  return result.Items as UnprocessedCompany[];
};

export const deleteBatch = async (nifs: number[]) => {
  const db = getDynamoInstance();

  const tableName = process.env.UNPROCESSED_COMPANIES_TABLE!;

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
        [tableName]: deleteRequests
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
      TableName: process.env.UNPROCESSED_COMPANIES_TABLE,
      Item: item
    })
  );
};
