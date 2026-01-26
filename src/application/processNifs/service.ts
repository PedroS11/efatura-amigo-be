import { saveCompany } from "../../infrastructure/companiesTable";
import { mapCaeToCategory } from "../../infrastructure/crawler/caeMapper";
import { searchNif } from "../../infrastructure/nif-pt";

export const processNif = async (nif: number): Promise<void> => {
  console.log({
    message: "Processing NIF",
    nif
  });

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

  const caeAsString: string = Array.isArray(company.cae) ? company.cae?.[0] : company.cae;

  if (!caeAsString) {
    console.log({
      message: "No valid cae found",
      nif,
      caeAsString
    });
    return;
  }

  const category = mapCaeToCategory(Number(caeAsString));
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
