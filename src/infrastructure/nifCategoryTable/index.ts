import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import { getDynamoInstance } from "./service";
import type { Categories, NifCategory } from "./types";

/**
 * Get category by NIF
 * @param {number} nif - Nif
 */
export const getCategory = async (nif: number): Promise<Categories | undefined> => {
  const db = getDynamoInstance();

  const result = await db.send(
    new GetCommand({
      TableName: process.env.NIF_CATEGORY_TABLE_NAME,
      Key: {
        nif
      }
    })
  );

  const row = result.Item as NifCategory | undefined;

  return row?.category;
};

export const saveCompany = async (nif: number, name: string, category: Categories): Promise<void> => {
  const db = getDynamoInstance();
  const item: NifCategory = {
    category,
    name,
    nif
  };

  await db.send(
    new PutCommand({
      TableName: process.env.NIF_CATEGORY_TABLE_NAME,
      Item: item
    })
  );
};
