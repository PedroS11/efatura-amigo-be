import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

import { getDynamoInstance } from "./service";
import type { Categories, Company } from "./types";

/**
 * Get category by NIF
 * @param {number} nif - Nif
 */
export const getCategory = async (nif: number): Promise<Categories | undefined> => {
  const db = getDynamoInstance();

  const result = await db.send(
    new GetCommand({
      TableName: process.env.COMPANIES_TABLE,
      Key: {
        nif
      }
    })
  );

  const row = result.Item as Company | undefined;

  return row?.category;
};

export const saveCompany = async (nif: number, name: string, category: Categories): Promise<void> => {
  const db = getDynamoInstance();
  const item: Company = {
    category,
    name,
    nif
  };

  await db.send(
    new PutCommand({
      TableName: process.env.COMPANIES_TABLE,
      Item: item
    })
  );
};

export const checkIfCompanyAlreadyProcessed = async (nif: number): Promise<boolean> => {
  const category = await getCategory(nif);

  return category !== undefined;
};
