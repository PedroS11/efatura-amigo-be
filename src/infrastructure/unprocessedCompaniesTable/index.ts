import type { ScanCommandOutput } from "@aws-sdk/lib-dynamodb";
import { BatchWriteCommand, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoInstance } from "../utils/aws/dynamo/utils";
import { getEnvironmentVariable } from "../utils/getEnvironmentVariable";
import type { UnprocessedCompany } from "./types";

const UNPROCESSED_COMPANIES_TABLE = getEnvironmentVariable("UNPROCESSED_COMPANIES_TABLE");

/**
 * Get a specified number of unprocessed companies
 * @param {number} limit - Number of unprocessed companies to retrieve
 */
export const getUnprocessedCompanies = async (limit: number): Promise<UnprocessedCompany[]> => {
  const db = getDynamoInstance();

  const companies: UnprocessedCompany[] = [];
  let outputResult: ScanCommandOutput;

  let exclusiveStartKey: ScanCommandOutput["LastEvaluatedKey"] | undefined = undefined;

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
      companies.push(...items);

      exclusiveStartKey = outputResult.LastEvaluatedKey;
    }
  } while (outputResult.LastEvaluatedKey && companies.length < limit);

  return companies;
};

export const deleteBatch = async (nifs: number[]): Promise<void> => {
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

export const addCompanyToProcess = async (nif: number): Promise<void> => {
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
