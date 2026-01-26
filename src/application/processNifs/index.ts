import { getExistingNifsFromList } from "../../infrastructure/companiesTable";
import { MAX_REQUESTS_PER_DAY } from "../../infrastructure/nif-pt/constants";
import { deleteBatch, getUnprocessedCompanies } from "../../infrastructure/unprocessedCompaniesTable";
import { logMessage } from "../../infrastructure/utils/logger";
import { processNif } from "./service";

export const handler = async (): Promise<void> => {
  // TODO Check if worth delete just the successful ones
  const rows = await getUnprocessedCompanies(MAX_REQUESTS_PER_DAY);
  const nifs = rows.map(({ nif }) => nif);
  logMessage("Nifs", nifs);

  const existingNifs = await getExistingNifsFromList(nifs);
  logMessage("existingNifs", existingNifs);

  const unprocessedNifs = nifs.filter(nif => !existingNifs.includes(nif));
  logMessage("unprocessedNifs", unprocessedNifs);

  if (unprocessedNifs.length > 0) {
    await Promise.all(unprocessedNifs.map(nif => processNif(nif)));
  }

  while (rows.length > 0) {
    const batch = rows.splice(0, 25);

    await deleteBatch(batch.map(({ nif }) => nif));
  }
};
