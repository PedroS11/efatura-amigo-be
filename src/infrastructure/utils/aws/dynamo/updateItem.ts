import { UpdateCommand, type UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { getDynamoInstance } from "./utils";

export const updateItem = async (params: UpdateCommandInput): Promise<void> => {
  const db = getDynamoInstance();

  await db.send(new UpdateCommand(params));
};
