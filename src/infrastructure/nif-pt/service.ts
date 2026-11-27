import axios, { type AxiosInstance } from "axios";
import { axiosLoggerInterceptor } from "../utils/axiosLoggerInterceptor";
import type { SearchNifPtCompanyResponse, SearchNifPtResponse } from "./types";

let axiosInstance: AxiosInstance;

export const getAxiosInstance = (timeout: number = 8000): AxiosInstance => {
  if (!axiosInstance) {
    axiosInstance = axiosLoggerInterceptor(axios.create({ timeout }));
  }

  return axiosInstance;
};

const isNoRecordFoundError = (response: SearchNifPtResponse) => response?.message?.includes("records found");

const isCreditsExceededError = (response: SearchNifPtResponse) => response?.message?.includes("credits");

export const parseSearchNifPtResponse = (
  response: SearchNifPtResponse,
  nif: number
): SearchNifPtCompanyResponse | undefined => {
  if (response.result === "success") {
    return {
      error: false,
      company: response?.records?.[nif]
    };
  } else if (isNoRecordFoundError(response)) {
    return {
      error: false,
      company: undefined,
      message: `Could not find any record for nif ${nif}`
    };
  } else if (isCreditsExceededError(response)) {
    return {
      error: true,
      company: undefined,
      message: response.message
    };
  }
  return;
};
