import { DeleteCommand, type DeleteCommandInput } from "@aws-sdk/lib-dynamodb";
import { getDynamoInstance } from "./utils";

export const deleteItem = async <T>(table: string, key: DeleteCommandInput["Key"]): Promise<void> => {
  const db = getDynamoInstance();

  await db.send(
    new DeleteCommand({
      TableName: table,
      Key: key
    })
  );
};
