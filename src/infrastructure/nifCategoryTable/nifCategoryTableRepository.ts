import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import { getDynamoInstance } from "./nifCategoryTableService";
import type { Categories, NifCategory } from "./types";

const TABLE_NAME = "NifCategoryTable";

/**
 * Get category by NIF
 * @param {string} nif - Nif
 */
export const getCategory = async (nif: string): Promise<Categories | undefined> => {
  const db = getDynamoInstance();

  const result = await db.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        nif
      }
    })
  );

  const row = result.Item as NifCategory | undefined;

  return row?.category;
};

export const saveCompany = async (nif: string, name: string, category: Categories): Promise<void> => {
  const db = getDynamoInstance();

  await db.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        category,
        name,
        nif
      } as NifCategory
    })
  );
};
