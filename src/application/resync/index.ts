import { scanTable } from "../../infrastructure/companiesTable";
import type { Company } from "../../infrastructure/companiesTable/types";

export const handler = async (): Promise<void> => {
  // Get all categories with 7 or higher and decrease it by
  const affectedCompanies: Company[] = await scanTable();
  console.log(JSON.stringify(affectedCompanies));

  // // Decrease its category by 1 and save
  // for (const company of affectedCompanies) {
  //   company.category = company!.category! - 1;
  //   await saveCompany(company.nif, company.name, company.category);
  // }
};
