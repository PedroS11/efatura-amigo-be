import type { AxiosResponse } from "axios";
import axios from "axios";

import type { NifPTCompany, NifPtResponse } from "./types";

// TODO Add interceptor
export const searchNif = async (nif: number): Promise<NifPTCompany | undefined> => {
  const response: AxiosResponse<NifPtResponse> = await axios.get(
    `http://www.nif.pt/?json=1&q=${nif}&key=${process.env.NIF_PT_API_KEY}`
  );

  console.log({
    message: "Nif Pt response",
    data: JSON.stringify(response.data)
  });

  if (response.data.result === "success" && response.data?.records?.[nif]) {
    return response.data.records[nif];
  }

  console.error(response.data.message);
  return;
};
