import { saveCompany } from "../../infrastructure/companiesTable";
import { searchNif } from "../../infrastructure/nif-pt";
import { mapCaeToCategory } from "../../infrastructure/utils/caeMapper";
import { logMessage } from "../../infrastructure/utils/logger";

export const processNif = async (nif: number): Promise<void> => {
  logMessage("Processing NIF", nif);

  const company = await searchNif(nif);
  if (!company) {
    logMessage("No company found", nif);
    return;
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
    return;
  }

  const category = mapCaeToCategory(Number(caeAsString));
  if (category !== undefined) {
    await saveCompany(company.nif, company.title, category);
  }

  logMessage("Finished processing NIF", { nif, cae: company.cae, category });
};
