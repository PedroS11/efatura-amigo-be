import type { NifPTCompany } from "./types";

// TODO Add interceptor
export const searchNif = async (nif: number): Promise<NifPTCompany | undefined> => {
  // const response: AxiosResponse<NifPtResponse> = await axios.get(
  //   `http://www.nif.pt/?json=1&q=${nif}&key=${process.env.NIF_PT_API_KEY}`
  // );
  //
  // if (response.data.result === "success" && response.data?.records?.[nif]) {
  //   return response.data.records[nif];
  // }
  //
  // console.error(response.data.message);
  return;
};
