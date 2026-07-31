import { scanTable } from "../../infrastructure/companiesTable";
import type { Company } from "../../infrastructure/companiesTable/types";
import { addCompanyToProcess } from "../../infrastructure/unprocessedCompaniesTable";
import type { DynamoDBFilter } from "../../infrastructure/utils/aws/dynamo/utils";

export const handler = async (): Promise<void> => {
  // Get all categories with 7 or higher and decrease it by
  const filters: DynamoDBFilter[] = [
    {
      column: "caeRev3",
      comparator: "attribute_not_exists",
      value: undefined
    },
    {
      column: "name",
      comparator: "<>",
      value: "NOT_FOUND"
    }
  ];
  const affectedCompanies: Company[] = await scanTable(filters);

  for (const company of affectedCompanies) {
    await addCompanyToProcess(company.nif);
  }
};
