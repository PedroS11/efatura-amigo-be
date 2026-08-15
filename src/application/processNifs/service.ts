import { saveCompany } from "../../infrastructure/companiesTable";
import type { Company } from "../../infrastructure/companiesTable/types";
import { searchNif } from "../../infrastructure/nif-pt";
import { saveObject } from "../../infrastructure/utils/algolia";
import { mapCaeToCategory } from "../../infrastructure/utils/caeMapper";
import { getEnvironmentVariable } from "../../infrastructure/utils/getEnvironmentVariable";
import { logError, logMessage } from "../../infrastructure/utils/logger";

const companiesIndex = getEnvironmentVariable("ALGOLIA_COMPANIES_INDEX");

export const processNif = async (nif: number): Promise<boolean> => {
  logMessage("Processing NIF", nif);

  const response = await searchNif(nif);

  if (response.error) {
    logError(`Error searching NIF: ${nif}`, response);

    return false;
  } else if (response.company === undefined) {
    logMessage(`Company ${nif} not found`, response);

    const company: Company = {
      category: undefined,
      name: "NOT_FOUND",
      nif,
      caeRev3: undefined,
      updatedAt: Date.now()
    };

    await saveCompany(company);
    await saveObject(companiesIndex, company);

    return true;
  }

  const company = response.company;

  // NIF.pt sometimes returns CAE as string, others as an array of strings
  const caeAsString: string = Array.isArray(company.cae) ? company.cae?.[0] : company.cae;

  if (!caeAsString) {
    logMessage("No valid cae found", {
      nif,
      caeAsString
    });

    return true;
  }

  const category = mapCaeToCategory(Number(caeAsString));
  // Even if no category was found, save it as undefined to avoid re processing the same item over again and waste credits
  const companyToSave: Company = {
    category,
    name: company.title,
    nif,
    caeRev3: caeAsString,
    updatedAt: Date.now()
  };

  // TODO: Add Promise.all
  await saveCompany(companyToSave);
  await saveObject(companiesIndex, companyToSave);

  logMessage("Finished processing NIF", { nif, cae: company.cae, category });

  return true;
};
