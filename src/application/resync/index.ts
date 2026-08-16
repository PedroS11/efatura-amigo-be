import { saveCompanyInAlgolia } from "../../infrastructure/companiesIndex";
import { scanTable } from "../../infrastructure/companiesTable";
import type { Company } from "../../infrastructure/companiesTable/types";

export const handler = async (): Promise<void> => {
  // Get all categories with 7 or higher and decrease it by
  // const filters: DynamoDBFilter[] = [
  //   {
  //     column: "caeRev3",
  //     comparator: "attribute_not_exists",
  //     value: undefined
  //   },
  //   {
  //     column: "name",
  //     comparator: "<>",
  //     value: "NOT_FOUND"
  //   }
  // ];
  const affectedCompanies: Company[] = await scanTable([]);
  console.log("count", affectedCompanies.length);

  for (const company of affectedCompanies) {
    console.log(company);
    // await addCompanyToProcess(company.nif);
    await saveCompanyInAlgolia(company);
  }
};
