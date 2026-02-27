import axios, { type AxiosInstance } from "axios";
import { axiosLoggerInterceptor } from "../utils/axiosLoggerInterceptor";
import type { SearchNifPtResponse, SearchNifResponse } from "./types";

let axiosInstance: AxiosInstance;

export const getAxiosInstance = (): AxiosInstance => {
  if (!axiosInstance) {
    axiosInstance = axiosLoggerInterceptor(axios.create());
  }

  return axiosInstance;
};

const isNoRecordFoundError = (response: SearchNifPtResponse) => response?.message?.includes("records found");

const isCreditsExceededError = (response: SearchNifPtResponse) => response?.message?.includes("credits");

export const parseSearchNifResponse = (response: SearchNifPtResponse, nif: number): SearchNifResponse | undefined => {
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
