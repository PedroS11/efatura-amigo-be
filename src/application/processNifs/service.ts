import { checkIfCompanyAlreadyProcessed, saveCompany } from "../../infrastructure/companiesTable";
import { mapCaeToCategory } from "../../infrastructure/crawler/caeMapper";
import { searchNif } from "../../infrastructure/nif-pt";

export const processNif = async (nif: number): Promise<void> => {
  console.log({
    message: "Processing NIF",
    nif
  });

  const nifAlreadyProcessed = await checkIfCompanyAlreadyProcessed(nif);

  if (!nifAlreadyProcessed) {
    console.log({
      message: "Nif already processed",
      nif
    });
    return;
  }

  const company = await searchNif(nif);
  if (!company) {
    console.log({
      message: "No company found",
      nif
    });
    return;
  }

  console.log({
    message: "NIF CAE",
    nif,
    cae: company.cae
  });

  const category = mapCaeToCategory(Number(company.cae));
  if (category !== undefined) {
    await saveCompany(company.nif, company.title, category);
  }

  console.log({
    message: "Finished processing NIF",
    nif,
    cae: company.cae,
    category
  });
};
