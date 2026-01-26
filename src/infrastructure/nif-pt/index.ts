import type { AxiosResponse } from "axios";
import axios from "axios";

import { logError, logMessage } from "../utils/logger";
import type { NifPTCompany, NifPtResponse } from "./types";

// TODO Add interceptor
export const searchNif = async (nif: number): Promise<NifPTCompany | undefined> => {
  const response: AxiosResponse<NifPtResponse> = await axios.get(
    `http://www.nif.pt/?json=1&q=${nif}&key=${process.env.NIF_PT_API_KEY}`
  );

  logMessage("Nif Pt response", response.data);

  if (response.data.result === "success" && response.data?.records?.[nif]) {
    return response.data.records[nif];
  }

  logError("Error from NIF.PT", response.data.message);
  return;
};
