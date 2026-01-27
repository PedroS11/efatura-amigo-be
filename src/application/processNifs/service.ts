import { saveCompany } from "../../infrastructure/companiesTable";
import { searchNif } from "../../infrastructure/nif-pt";
import type { Credit, QueryNifPtResponse } from "../../infrastructure/nif-pt/types";
import { mapCaeToCategory } from "../../infrastructure/utils/caeMapper";
import { logMessage } from "../../infrastructure/utils/logger";

export interface ProcessNifResponse {
  error: boolean;
  credits: Credit;
  message: string;
}

const processError = (response: QueryNifPtResponse): ProcessNifResponse => {
  if (response.message.includes("Please, try again later or buy credits")) {
    return {
      error: true,
      credits: response.credits.left,
      message: response.message
    };
  } else if (response.message.includes("Record not found")) {
    return {
      error: false,
      credits: response.credits.left,
      message: response.message
    };
  } else {
    return {
      error: true,
      credits: response.credits.left,
      message: response.message
    };
  }
};

export const processNif = async (nif: number): Promise<ProcessNifResponse> => {
  logMessage("Processing NIF", nif);

  const response = await searchNif(nif);

  if (response.result === "error") {
    logMessage("Error searching company", {
      nif,
      response
    });

    return processError(response);
  }

  const company = response.records![nif]!;

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

    return {
      error: false,
      credits: response.credits.left,
      message: "No valid cae found"
    };
  }

  const category = mapCaeToCategory(Number(caeAsString));
  if (category !== undefined) {
    await saveCompany(company.nif, company.title, category);
  }

  logMessage("Finished processing NIF", { nif, cae: company.cae, category });

  return {
    error: false,
    credits: response.credits.left,
    message: "Finished processing NIF"
  };
};
