import { DescribeTableCommand, type DescribeTableCommandOutput } from "@aws-sdk/client-dynamodb";
import { getDynamoInstance } from "./utils";

export const describeTable = async (table: string): Promise<DescribeTableCommandOutput> => {
  const db = getDynamoInstance();

  return await db.send(
    new DescribeTableCommand({
      TableName: table
    })
  );
};
