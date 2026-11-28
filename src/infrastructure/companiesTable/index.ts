import type { UpdateCommandInput } from "@aws-sdk/lib-dynamodb";
import { describeTable } from "../utils/aws/dynamo/describeTable";
import { fullScanTable } from "../utils/aws/dynamo/fullScanTable";
import { getItem } from "../utils/aws/dynamo/getItem";
import { updateItem } from "../utils/aws/dynamo/updateItem";
import type { DynamoDBFilter } from "../utils/aws/dynamo/utils";
import { getEnvironmentVariable } from "../utils/getEnvironmentVariable";
import type { Company } from "./types";

const COMPANIES_TABLE = getEnvironmentVariable("COMPANIES_TABLE");
/**
 * Get category by NIF
 * @param {number} nif - Nif
 */
export const getCompany = async (nif: number): Promise<Company | undefined> => {
  return await getItem(COMPANIES_TABLE, {
    nif
  });
};

export const scanTable = async (filters: DynamoDBFilter[]): Promise<Company[]> => {
  return await fullScanTable(COMPANIES_TABLE, filters);
};

export const getCompaniesTableMetadata = async () => await describeTable(COMPANIES_TABLE);

export const updateCompany = async (company: Company): Promise<void> => {
  const params = Object.entries(company).reduce(
    (acum, [key, value]) => {
      if (key !== "nif" && value !== undefined) {
        acum.values![`:${key}`] = value;
        acum.names![`#${key}`] = key;
        acum.updateExpression.push(`#${key} = :${key}`);
      }
      return acum;
    },
    { values: {}, names: {}, updateExpression: [] } as {
      values: UpdateCommandInput["ExpressionAttributeValues"];
      names: UpdateCommandInput["ExpressionAttributeNames"];
      updateExpression: string[];
    }
  );

  const input: UpdateCommandInput = {
    Key: {
      nif: company.nif
    },
    UpdateExpression: `SET ${params.updateExpression.join(", ")}`,
    ExpressionAttributeNames: params.names,
    ExpressionAttributeValues: params.values,
    TableName: COMPANIES_TABLE
  };
  await updateItem(input);
};
