import { MAX_REQUESTS_PER_DAY } from "../../infrastructure/nif-pt/constants";
import { getUnprocessedCompany } from "../../infrastructure/unprocessedCompaniesTable";
import { processNif } from "./service";

export const handler = async (): Promise<void> => {
  // TODO Check if worth delete just the successful ones
  const rows = await getUnprocessedCompany(MAX_REQUESTS_PER_DAY);

  await Promise.all(rows.map(({ nif }) => processNif(nif)));

  // TODO Delete after processing
  // while (nifs.length > 0) {
  //   const batch = nifs.splice(0, 25);
  //
  //   await deleteBatch(batch);
  // }
};
