import { scanTable } from "../../infrastructure/companiesTable";
import type { Company } from "../../infrastructure/companiesTable/types";

export const handler = async (): Promise<void> => {
  // Get all categories greater or equal of 7 and reduce it by one
  const affectedCompanies: Company[] = await scanTable();
  console.log(JSON.stringify(affectedCompanies));

  // Increase its category by 1 and save
  // for (const company of affectedCompanies) {
  //   company.category = company!.category! - 1;
  //   await saveCompany(company.nif, company.name, company.category, company.caeRev3);
  // }
};
