import { scanTable } from "../../infrastructure/companiesTable";
import type { Company } from "../../infrastructure/companiesTable/types";
import type { DynamoDBFilter } from "../../infrastructure/utils/aws/dynamo/utils";

export const handler = async (): Promise<void> => {
  // Get all categories with 7 or higher and decrease it by
  const filters: DynamoDBFilter[] = [
    {
      column: "caeRev3",
      comparator: "attribute_not_exists",
      value: undefined
    }
  ];
  const affectedCompanies: Company[] = await scanTable(filters);
  console.log(JSON.stringify(affectedCompanies));

  // Decrease its category by 1 and save
  // for (const company of affectedCompanies) {
  //   await addCompanyToProcess(company.nif);
  // }
};
