import type { AxiosResponse } from "axios";
import { isAxiosError } from "axios";

import { logError, logMessage } from "../utils/logger";
import { getAxiosInstance, parseSearchNifResponse } from "./service";
import type { Credit, GetCreditsResponse, SearchNifPtResponse, SearchNifResponse } from "./types";

export const searchNif = async (nif: number): Promise<SearchNifResponse> => {
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

    const parsedResponse: SearchNifResponse | undefined = parseSearchNifResponse(nifPtResponse, nif);

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
  const response: AxiosResponse<GetCreditsResponse> = await getAxiosInstance().get("http://www.nif.pt/", {
    params: {
      json: "1",
      credits: "1",
      key: process.env.NIF_PT_API_KEY
    }
  });

  return response.data.credits;
};
