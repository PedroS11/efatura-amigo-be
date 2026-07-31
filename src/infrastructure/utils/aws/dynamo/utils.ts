import type { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, type ScanCommandInput } from "@aws-sdk/lib-dynamodb";

export const MAX_ITEMS_PER_BATCH = 25;

let instance: DynamoDBDocumentClient;

export const getDynamoInstance = (): DynamoDBDocumentClient => {
  if (!instance) {
    const options: DynamoDBClientConfig = {
      region: "eu-west-2"
    };

    instance = DynamoDBDocumentClient.from(new DynamoDBClient(options), {
      marshallOptions: {
        removeUndefinedValues: true
      }
    });
  }

  return instance;
};

export interface DynamoDBFilter {
  column: string;
  comparator: "=" | "<>" | "<" | "<=" | ">" | ">=" | "attribute_not_exists";
  value: unknown;
}

export const mapFilterToFilterExpression = (filters: DynamoDBFilter[]) => {
  const filtersArray = [];

  for (const filter of filters) {
    if (filter.comparator === "attribute_not_exists") {
      filtersArray.push(`attribute_not_exists(#${filter.column})`);
    } else {
      filtersArray.push(`#${filter.column} ${filter.comparator} :${filter.column}`);
    }
  }

  const expressionAttributeValues: ScanCommandInput["ExpressionAttributeValues"] = filters.reduce(
    (acum, filter) => {
      if (filter.value !== undefined) {
        acum![`:${filter.column}`] = filter.value;
      }
      return acum;
    },
    {} as ScanCommandInput["ExpressionAttributeValues"]
  );

  const expressionAttributeNames: ScanCommandInput["ExpressionAttributeNames"] = filters.reduce(
    (acum, filter) => {
      acum![`#${filter.column}`] = filter.column;
      return acum;
    },
    {} as ScanCommandInput["ExpressionAttributeNames"]
  );

  return {
    filterExpression: filtersArray.join(" AND "),
    expressionAttributeValues,
    expressionAttributeNames
  };
};
