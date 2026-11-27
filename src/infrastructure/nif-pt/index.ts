import type { AxiosResponse } from "axios";
import { isAxiosError } from "axios";

import { logError, logMessage } from "../utils/logger";
import { getAxiosInstance, parseSearchNifPtResponse } from "./service";
import type { Credit, GetCreditsResponse, SearchNifPtCompanyResponse, SearchNifPtResponse } from "./types";

export const searchNifPtCompany = async (nif: number): Promise<SearchNifPtCompanyResponse> => {
  try {
    const response: AxiosResponse<SearchNifPtResponse> = await getAxiosInstance().get("http://www.nif.pt/", {
      params: {
        json: "1",
        q: `${nif}`,
        key: process.env.NIF_PT_API_KEY
      }
    });

    const nifPtResponse: SearchNifPtResponse = response.data;

    logMessage("NIF.PT response", nifPtResponse);

    const parsedResponse: SearchNifPtCompanyResponse | undefined = parseSearchNifPtResponse(nifPtResponse, nif);

    if (parsedResponse) {
      return parsedResponse;
    }

    throw new Error(`NIF.pt returned unexpected error ${JSON.stringify(response.data)}`);
  } catch (error) {
    if (!isAxiosError(error)) {
      const unknownError: Error = error as Error;

      logError("Unexpected error calling NIF.PT", {
        nif,
        errorMessage: unknownError.message
      });
    }

    throw error;
  }
};

export const getCredits = async (): Promise<Credit> => {
  const response: AxiosResponse<GetCreditsResponse> = await getAxiosInstance(3000).get("http://www.nif.pt/", {
    params: {
      json: "1",
      credits: "1",
      key: process.env.NIF_PT_API_KEY
    }
  });

  return response.data.credits;
};
