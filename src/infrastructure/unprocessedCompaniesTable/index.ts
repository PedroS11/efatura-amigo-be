import type { ScanCommandOutput } from "@aws-sdk/lib-dynamodb";
import { BatchWriteCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

import { getEnvironmentVariable } from "../utils/getEnvironmentVariable";
import { getDynamoInstance } from "./service";
import type { UnprocessedCompany } from "./types";

const UNPROCESSED_COMPANIES_TABLE = getEnvironmentVariable("UNPROCESSED_COMPANIES_TABLE");

/**
 * Get category by NIF
 * @param {number} nif - Nif
 */
export const getUnprocessedCompanies = async (limit: number): Promise<UnprocessedCompany[]> => {
  const db = getDynamoInstance();

  const companies: UnprocessedCompany[] = [];
  let outputResult: ScanCommandOutput;

  let exclusiveStartKey: ScanCommandOutput["LastEvaluatedKey"] = undefined;

  do {
    outputResult = await db.send(
      new ScanCommand({
        TableName: UNPROCESSED_COMPANIES_TABLE,
        Limit: limit - companies.length,
        ExclusiveStartKey: exclusiveStartKey
      })
    );

    const items = outputResult.Items as UnprocessedCompany[];
    if (items?.length) {
      items.forEach(item => companies.push(item));

      exclusiveStartKey = outputResult.LastEvaluatedKey;
    }
  } while (outputResult.LastEvaluatedKey && companies.length < limit);

  return companies;
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
