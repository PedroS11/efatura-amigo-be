import { describeTable } from "../utils/aws/dynamo/describeTable";
import { fullScanTable } from "../utils/aws/dynamo/fullScanTable";
import { getItem } from "../utils/aws/dynamo/getItem";
import { putItem } from "../utils/aws/dynamo/putItem";
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

export const saveCompany = async (company: Company): Promise<void> => {
  await putItem(COMPANIES_TABLE, company);
};

export const scanTable = async (filters: DynamoDBFilter[]): Promise<Company[]> => {
  return await fullScanTable(COMPANIES_TABLE, filters);
};

export const getCompaniesTableMetadata = async () => await describeTable(COMPANIES_TABLE);
