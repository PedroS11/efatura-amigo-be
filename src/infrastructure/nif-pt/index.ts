import type { AxiosError, AxiosResponse } from "axios";
import axios from "axios";

import { logError, logMessage } from "../utils/logger";
import type { Credit, GetCreditsResponse, NifPtResponse, SearchNifResponse } from "./types";

const isNoRecordFoundError = (response: NifPtResponse) => response.message.includes("record found");
const isCreditsExceededError = (response: NifPtResponse) => response.message.includes("credits");

export const searchNif = async (nif: number): Promise<SearchNifResponse> => {
  try {
    const response: AxiosResponse<NifPtResponse> = await axios.get(`http://www.nif.pt/`, {
      params: {
        json: "1",
        q: `${nif}`,
        key: process.env.NIF_PT_API_KEY
      }
    });

    logMessage("NIF.PT response", response.data);

    if (response.data.result === "success") {
      return {
        error: false,
        company: response?.data?.records?.[nif]
      };
    }
    if (isNoRecordFoundError(response.data)) {
      return {
        error: false,
        company: undefined,
        message: `Could not find any record for nif ${nif}`
      };
    } else if (isCreditsExceededError(response.data)) {
      return {
        error: true,
        company: undefined,
        message: response.data.message
      };
    }

    throw new Error(`NIF.pt returned unexpected error ${JSON.stringify(response.data)}`);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError: AxiosError = error;

      logError("NIF.PT request error", {
        nif,
        errorMessage: axiosError.message,
        response: JSON.stringify(axiosError.response?.data),
        request: JSON.stringify(axiosError.request)
      });
    } else {
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
  const response: AxiosResponse<GetCreditsResponse> = await axios.get(
    `http://www.nif.pt/?json=1&credits=1&key=${process.env.NIF_PT_API_KEY}`
  );

  return response.data.credits;
};
