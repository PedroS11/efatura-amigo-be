import type { DynamoDBClientConfig } from "@aws-sdk/client-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

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
