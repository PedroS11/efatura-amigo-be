import { ScanCommand, type ScanCommandOutput } from "@aws-sdk/lib-dynamodb";
import { type DynamoDBFilter, getDynamoInstance, mapFilterToFilterExpression } from "./utils";

export const fullScanTable = async <T>(table: string, filters: DynamoDBFilter[]): Promise<T[]> => {
  const db = getDynamoInstance();

  let lastEvaluatedKey: ScanCommandOutput["LastEvaluatedKey"];
  const data: T[] = [];

  const { filterExpression, expressionAttributeValues, expressionAttributeNames } =
    mapFilterToFilterExpression(filters);

  do {
    const response: ScanCommandOutput = await db.send(
      new ScanCommand({
        TableName: table,
        ...(lastEvaluatedKey && {
          ExclusiveStartKey: lastEvaluatedKey
        }),
        ...(filterExpression.length && {
          FilterExpression: filterExpression
        }),
        ...(Object.keys(expressionAttributeValues ?? {}).length > 0 && {
          ExpressionAttributeValues: expressionAttributeValues
        }),
        ...(Object.keys(expressionAttributeNames ?? {}).length > 0 && {
          ExpressionAttributeNames: expressionAttributeNames
        })
      })
    );

    data.push(...((response.Items ?? []) as T[]));
    lastEvaluatedKey = response.LastEvaluatedKey;
  } while (lastEvaluatedKey !== undefined);

  return data;
};
