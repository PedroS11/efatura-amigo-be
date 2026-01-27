import { getExistingNifsFromList } from "../../infrastructure/companiesTable";
import { getCredits } from "../../infrastructure/nif-pt";
import { MAX_REQUESTS_PER_MINUTE } from "../../infrastructure/nif-pt/constants";
import type { Credit } from "../../infrastructure/nif-pt/types";
import { getSSM, updateSSM } from "../../infrastructure/ssm";
import { deleteBatch, getUnprocessedCompanies } from "../../infrastructure/unprocessedCompaniesTable";
import { logMessage } from "../../infrastructure/utils/logger";
import type { ProcessNifResponse } from "./service";
import { processNif } from "./service";

const getNextRunTimestamp = (credits: Credit) => {
  const current = new Date();
  if (credits.month === 0) {
    current.setDate(current.getDate() + 31);
  } else if (credits.day === 0) {
    current.setHours(current.getHours() + 24);
  } else if (credits.hour === 0) {
    current.setMinutes(current.getMinutes() + 60);
  } else if (credits.minute === 0) {
    current.setMinutes(current.getMinutes() + 1);
  }

  return current;
};

export const handler = async (): Promise<void> => {
  const nextTimestampRun = await getSSM("E");

  if (Date.now() < new Date(nextTimestampRun).getTime()) {
    logMessage("Lambda ran before the next run timestamp", {
      nextTimestampRun,
      now: Date.now(),
      nextRun: new Date(nextTimestampRun).getTime()
    });

    return;
  }

  const credits = await getCredits();
  if (credits.minute === 0 || credits.hour === 0 || credits.day === 0 || credits.month === 0) {
    logMessage("Nif.pt minute limits exceeded", credits);
    return;
  }

  const rows = await getUnprocessedCompanies(MAX_REQUESTS_PER_MINUTE);
  if (rows.length === 0) {
    logMessage("No rows to process");
    return;
  }

  let nifs = rows.map(({ nif }) => nif);
  logMessage("Nifs", nifs);

  if (nifs.length > credits.minute) {
    nifs = nifs.slice(0, credits.minute);
  }

  const existingNifs = await getExistingNifsFromList(nifs);
  logMessage("existingNifs", existingNifs);

  const unprocessedNifs = nifs.filter(nif => !existingNifs.includes(nif));
  logMessage("unprocessedNifs", unprocessedNifs);

  // If nothing to process, delete the already processed NIFs
  if (unprocessedNifs.length === 0) {
    while (nifs.length > 0) {
      const batch = nifs.splice(0, 25);

      await deleteBatch(batch.map(nif => nif));
    }

    return;
  }

  const nifsToDelete = [...existingNifs];

  let response: ProcessNifResponse;

  for (const unprocessedNif of unprocessedNifs) {
    response = await processNif(unprocessedNif);

    if (response.error) {
      break;
    }

    nifsToDelete.push(unprocessedNif);
  }

  while (nifsToDelete.length > 0) {
    const batch = nifsToDelete.splice(0, 25);

    await deleteBatch(batch.map(nif => nif));
  }

  const timestamp = getNextRunTimestamp(response!.credits);
  await updateSSM("E", timestamp.getTime().toString());
};
