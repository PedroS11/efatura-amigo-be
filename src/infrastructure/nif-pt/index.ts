import type { AxiosError, AxiosResponse } from "axios";
import axios from "axios";

import { logError, logMessage } from "../utils/logger";
import type { Credit, GetCreditsResponse, QueryNifPtResponse } from "./types";

export const searchNif = async (nif: number): Promise<QueryNifPtResponse> => {
  try {
    const response: AxiosResponse<QueryNifPtResponse> = await axios.get(
      `http://www.nif.pt/?json=1&q=${nif}&key=${process.env.NIF_PT_API_KEY}`
    );

    logMessage("NIF.PT response", response.data);

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError: AxiosError = error;

      logError("NIF.PT request error", {
        errorMessage: axiosError.message,
        response: JSON.stringify(axiosError.response?.data),
        request: JSON.stringify(axiosError.request)
      });
    } else {
      const unknownError: Error = error as Error;

      logError("Unexpected error calling NIF.PT", {
        errorMessage: unknownError.message
      });
    }

    throw error;
  }
};

export const getCredits = async (): Promise<Credit> => {
  const response: AxiosResponse<GetCreditsResponse> = await axios.get(
    `http://www.nif.pt/?json=1&credits=1&key=${process.env.NIF_PT_API_KEY}`
  );

  return response.data.credits;
};

export const hasRunOutOfCredits = (credits: Credit): boolean => {
  return Object.values(credits).some(credit => credit === 0);
};
