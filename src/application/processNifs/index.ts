import { getExistingNifsFromList } from "../../infrastructure/companiesTable";
import { getCredits } from "../../infrastructure/nif-pt";
import { MAX_REQUESTS_PER_MINUTE } from "../../infrastructure/nif-pt/constants";
import { deleteBatch, getUnprocessedCompanies } from "../../infrastructure/unprocessedCompaniesTable";
import { logMessage } from "../../infrastructure/utils/logger";
import { processNif } from "./service";

export const handler = async (): Promise<void> => {
  const rows = await getUnprocessedCompanies(MAX_REQUESTS_PER_MINUTE);
  let nifs = rows.map(({ nif }) => nif);
  logMessage("Nifs", nifs);

  const credits = await getCredits();
  if (credits.minute === 0) {
    logMessage("Nif.pt minute limits exceeded", credits);
    return;
  }

  if (nifs.length > credits.minute) {
    nifs = nifs.slice(0, credits.minute);
  }

  const existingNifs = await getExistingNifsFromList(nifs);
  logMessage("existingNifs", existingNifs);

  const unprocessedNifs = nifs.filter(nif => !existingNifs.includes(nif));
  logMessage("unprocessedNifs", unprocessedNifs);

  const nifsToDelete = [...existingNifs];

  for (const unprocessedNif of unprocessedNifs) {
    if (await processNif(unprocessedNif)) {
      nifsToDelete.push(unprocessedNif);
    }
  }

  while (nifsToDelete.length > 0) {
    const batch = nifsToDelete.splice(0, 25);

    await deleteBatch(batch.map(nif => nif));
  }
};
