import { saveCompany } from "../../infrastructure/companiesTable";
import { searchNif } from "../../infrastructure/nif-pt";
import { mapCaeToCategory } from "../../infrastructure/utils/caeMapper";
import { logMessage } from "../../infrastructure/utils/logger";
import { wait } from "../../infrastructure/utils/wait";

export const processNif = async (nif: number): Promise<boolean> => {
  logMessage("Processing NIF", nif);

  const company = await searchNif(nif);
  // Only 1 call per minute
  await wait(60_000);

  if (!company) {
    logMessage("No company found", nif);
    return false;
  }

  logMessage("NIF CAE", {
    nif,
    cae: company.cae
  });

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
