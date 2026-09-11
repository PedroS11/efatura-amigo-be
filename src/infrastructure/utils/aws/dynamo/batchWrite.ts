import { BatchWriteCommand, type BatchWriteCommandInput } from "@aws-sdk/lib-dynamodb";
import { getDynamoInstance } from "./utils";

export type RequestItemsValue = NonNullable<BatchWriteCommandInput["RequestItems"]>[string];

export const batchWrite = async (table: string, requests: RequestItemsValue): Promise<void> => {
  const db = getDynamoInstance();

  await db.send(
    new BatchWriteCommand({
      RequestItems: {
        [table]: requests
      }
    })
  );
};
