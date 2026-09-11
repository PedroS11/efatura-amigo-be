import { GetCommand, type GetCommandInput } from "@aws-sdk/lib-dynamodb";
import { getDynamoInstance } from "./utils";

export const getItem = async <T>(table: string, key: GetCommandInput["Key"]): Promise<T | undefined> => {
  const db = getDynamoInstance();

  const result = await db.send(
    new GetCommand({
      TableName: table,
      Key: key
    })
  );

  return result.Item as T | undefined;
};
