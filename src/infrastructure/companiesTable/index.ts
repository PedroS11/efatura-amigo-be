import { GetCommand, PutCommand, ScanCommand, type ScanCommandOutput } from "@aws-sdk/lib-dynamodb";

import { type DynamoDBFilter, getDynamoInstance, mapFilterToFilterExpression } from "../utils/aws/dynamo/utils";
import { getEnvironmentVariable } from "../utils/getEnvironmentVariable";
import type { Company } from "./types";

const COMPANIES_TABLE = getEnvironmentVariable("COMPANIES_TABLE");
/**
 * Get category by NIF
 * @param {number} nif - Nif
 */
export const getCompany = async (nif: number): Promise<Company | undefined> => {
  const db = getDynamoInstance();

  const result = await db.send(
    new GetCommand({
      TableName: COMPANIES_TABLE,
      Key: {
        nif
      }
    })
  );

  return result.Item as Company | undefined;
};

export const saveCompany = async (company: Company): Promise<void> => {
  const db = getDynamoInstance();

  await db.send(
    new PutCommand({
      TableName: COMPANIES_TABLE,
      Item: company
    })
  );
};

export const scanTable = async (filters: DynamoDBFilter[]): Promise<Company[]> => {
  const db = getDynamoInstance();

  let lastEvaluatedKey: ScanCommandOutput["LastEvaluatedKey"];
  const companies: Company[] = [];

  const { filterExpression, expressionAttributeValues, expressionAttributeNames } =
    mapFilterToFilterExpression(filters);

  do {
    const response: ScanCommandOutput = await db.send(
      new ScanCommand({
        TableName: COMPANIES_TABLE,
        ...(lastEvaluatedKey && {
          ExclusiveStartKey: lastEvaluatedKey
        }),
        FilterExpression: filterExpression,
        ...(Object.keys(expressionAttributeValues ?? {}).length > 0 && {
          ExpressionAttributeValues: expressionAttributeValues
        }),
        ...(Object.keys(expressionAttributeNames ?? {}).length > 0 && {
          ExpressionAttributeNames: expressionAttributeNames
        })
      })
    );

    companies.push(...((response.Items ?? []) as Company[]));
    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey !== undefined);

  return companies;
};
