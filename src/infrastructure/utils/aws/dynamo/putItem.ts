import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoInstance } from "./utils";

export const putItem = async <T>(table: string, item: T): Promise<void> => {
  const db = getDynamoInstance();

  await db.send(
    new PutCommand({
      TableName: table,
      Item: item as Record<string, unknown> | undefined
    })
  );
};
