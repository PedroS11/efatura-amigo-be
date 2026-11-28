import { getCompany, updateCompany } from "../../infrastructure/companiesTable";
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
    logMessage(`Company ${nif} not found on NIF.pt`, response);

    const existingCompany = await getCompany(nif);
    if (existingCompany) {
      logMessage(`Company ${nif} already exists in the Dynamo`, existingCompany);

      return true;
    }

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

  const nifPtCompany = response.company;

  // NIF.pt sometimes returns CAE as string, others as an array of strings
  const cae: string = Array.isArray(nifPtCompany.cae) ? nifPtCompany.cae?.[0] : nifPtCompany.cae;

  if (!cae) {
    logMessage("No valid cae found", {
      nif,
      cae
    });

    return true;
  }

  const category = mapCaeRev3ToCategory(cae);
  // Even if no category was found, save it as undefined to avoid re processing the same item over again and waste credits
  const company: Company = {
    category,
    name: nifPtCompany.title,
    nif,
    caeRev3: cae,
    updatedAt: Date.now()
  };

  await updateCompany(company);

  logMessage("Finished processing NIF with NIF.pt", { nif, cae: nifPtCompany.cae, category });

  return true;
};

export const processNifWithSicae = async (nif: number): Promise<boolean> => {
  try {
    logMessage("Processing NIF with SICAE", nif);

    const sicaeCompany = await searchSicaeCompany(nif);
    if (!sicaeCompany) {
      logMessage("Company not found on SICAE", { nif });

      return false;
    }

    const category = mapCaeRev4ToCategory(sicaeCompany.caePrincipal?.codigo ?? "");
    if (!category) {
      await updateCompany({
        nif,
        caeRev4: sicaeCompany.caePrincipal!.codigo,
        name: sicaeCompany.nome,
        updatedAt: Date.now()
      });

      logMessage("No match cae rev4 to category", { nif, cae: sicaeCompany.caePrincipal!.codigo });

      return false;
    }

    const companyToSave: Company = {
      category,
      name: sicaeCompany.nome,
      nif,
      caeRev4: sicaeCompany.caePrincipal!.codigo,
      updatedAt: Date.now()
    };

    await updateCompany(companyToSave);

    logMessage("Finished processing NIF with SICAE", { nif, cae: sicaeCompany.caePrincipal!.codigo, category });

    return true;
  } catch (e) {
    const error: Error = e as Error;

    logError(`Error processing NIF with SICAE: ${nif}`, error.message);

    return false;
  }
};
