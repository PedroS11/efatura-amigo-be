import { updateCompany } from "../../infrastructure/companiesTable";
import type { Company } from "../../infrastructure/companiesTable/types";
import { searchNifPtCompany } from "../../infrastructure/nif-pt";
import { searchSicaeCompany } from "../../infrastructure/sicae";
import { mapCaeRev3ToCategory, mapCaeRev4ToCategory } from "../../infrastructure/utils/caeMapper";
import { logError, logMessage } from "../../infrastructure/utils/logger";

export const processNifWithNifPt = async (nif: number): Promise<boolean> => {
  logMessage("Processing NIF with NIF.pt", nif);

  const response = await searchNifPtCompany(nif);

  if (response.error) {
    logError(`Error searching NIF with NIF.pt: ${nif}`, response);

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

    await updateCompany(company);

    return true;
  }

  const company = response.company;

  // NIF.pt sometimes returns CAE as string, others as an array of strings
  const cae: string = Array.isArray(company.cae) ? company.cae?.[0] : company.cae;

  if (!cae) {
    logMessage("No valid cae found", {
      nif,
      cae
    });

    return true;
  }

  const category = mapCaeRev3ToCategory(cae);
  // Even if no category was found, save it as undefined to avoid re processing the same item over again and waste credits
  const companyToSave: Company = {
    category,
    name: company.title,
    nif,
    caeRev3: cae,
    updatedAt: Date.now()
  };

  await updateCompany(companyToSave);

  logMessage("Finished processing NIF with NIF.pt", { nif, cae: company.cae, category });

  return true;
};

export const processNifWithSicae = async (nif: number): Promise<boolean> => {
  try {
    logMessage("Processing NIF with SICAE", nif);

    const company = await searchSicaeCompany(nif);
    if (company?.caePrincipal?.codigo) {
      const category = mapCaeRev4ToCategory(company.caePrincipal.codigo);

      if (category) {
        const companyToSave: Company = {
          category,
          name: company.nome,
          nif,
          caeRev4: company.caePrincipal.codigo,
          updatedAt: Date.now()
        };

        await updateCompany(companyToSave);

        logMessage("Finished processing NIF with SICAE", { nif, cae: company.caePrincipal.codigo, category });

        return true;
      }
    }

    return false;
  } catch (e) {
    const error: Error = e as Error;

    logError(`Error processing NIF with SICAE: ${nif}`, error.message);

    return false;
  }
};
