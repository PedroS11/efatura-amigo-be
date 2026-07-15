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
    await saveCompany(nif, "NOT_FOUND", undefined);

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
  await saveCompany(company.nif, company.title, category);

  logMessage("Finished processing NIF", { nif, cae: company.cae, category });

  return true;
};
