import { saveCompany } from "../../infrastructure/companiesTable";
import { searchNif } from "../../infrastructure/nif-pt";
import { mapCaeToCategory } from "../../infrastructure/utils/caeMapper";
import { logError, logMessage } from "../../infrastructure/utils/logger";

export const processNif = async (nif: number): Promise<boolean> => {
  logMessage("Processing NIF", nif);

  const response = await searchNif(nif);

  if (response.error) {
    logError(`Error searching NIF: ${nif}`, response);
    return false;
  } else if (response.company === undefined) {
    logMessage(`Company ${nif} not found`, response);
    return true;
  }

  const company = response.company;

  const caeAsString: string = Array.isArray(company.cae) ? company.cae?.[0] : company.cae;

  if (!caeAsString) {
    logMessage("No valid cae found", {
      nif,
      caeAsString
    });
    return true;
  }

  const category = mapCaeToCategory(Number(caeAsString));
  if (category !== undefined) {
    await saveCompany(company.nif, company.title, category);
  }

  logMessage("Finished processing NIF", { nif, cae: company.cae, category });

  return true;
};
