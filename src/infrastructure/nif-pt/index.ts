import type { AxiosError, AxiosResponse } from "axios";
import axios from "axios";

import { logError, logMessage } from "../utils/logger";
import type { Credit, GetCreditsResponse, NifPTCompany, NifPtResponse } from "./types";

export const searchNif = async (nif: number): Promise<NifPTCompany | undefined> => {
  try {
    const response: AxiosResponse<NifPtResponse> = await axios.get(
      `http://www.nif.pt/?json=1&q=${nif}&key=${process.env.NIF_PT_API_KEY}`
    );

    logMessage("NIF.PT response", response.data);

    if (response.data.result === "success" && response.data?.records?.[nif]) {
      return response.data.records[nif];
    }

    logError("Error from NIF.PT response", response.data.message);
    return;
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
