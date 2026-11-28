import { getCredits } from "../../infrastructure/nif-pt";
import { sendMessage } from "../../infrastructure/telegramBot";
import { deleteBatch, getUnprocessedCompanies } from "../../infrastructure/unprocessedCompaniesTable";
import { MAX_UNPROCESSED_COMPANIES } from "../../infrastructure/unprocessedCompaniesTable/types";
import { MAX_ITEMS_PER_BATCH } from "../../infrastructure/utils/aws/dynamo/utils";
import { logMessage } from "../../infrastructure/utils/logger";
import { processNifWithNifPt, processNifWithSicae } from "./service";

export const handler = async (): Promise<void> => {
  const rows = await getUnprocessedCompanies(MAX_UNPROCESSED_COMPANIES);
  if (rows.length === 0) {
    logMessage("No rows to process");
    return;
  }

  const nifsToDelete: number[] = [];
  let nifsToRetry: number[] = [];

  for (const { nif } of rows) {
    try {
      const processed = await processNifWithSicae(nif);
      if (processed) {
        nifsToDelete.push(nif);
      } else {
        nifsToRetry.push(nif);
      }
    } catch (error) {
      logMessage(
        `Error thrown processing nif ${nif} with SICAE, error: ${(error as Error).message}, retrying with NIF.pt`
      );
      nifsToRetry.push(nif);

      await sendMessage(
        `Error thrown processing nif ${nif} with SICAE, error: ${(error as Error).message}, retrying with NIF.pt`
      );
    }
  }

  if (nifsToRetry.length > 0) {
    const credits = await getCredits();
    if (credits.minute === 0 || credits.hour === 0 || credits.day === 0 || credits.month === 0) {
      logMessage("Nif.pt minute limits exceeded", credits);
    } else {
      // I can only search on NIF.pt the amount of available credits
      if (nifsToRetry.length > credits.minute) {
        nifsToRetry = nifsToRetry.slice(0, credits.minute);
      }

      for (const nif of nifsToRetry) {
        try {
          const wasProcessed = await processNifWithNifPt(nif);
          if (wasProcessed) {
            nifsToDelete.push(nif);
          } else {
            logMessage(`Failed to process nif ${nif} with NIF.pt`);
            await sendMessage(`Failed to process nif ${nif} with NIF.pt`);
          }
        } catch (error) {
          logMessage(`Error thrown processing nif ${nif} with NIF.pt, error: ${(error as Error).message}`);
          await sendMessage(`Error thrown processing nif ${nif} with NIF.pt, error: ${(error as Error).message}`);
        }
      }
    }
  }

  while (nifsToDelete.length > 0) {
    const batch = nifsToDelete.splice(0, MAX_ITEMS_PER_BATCH);

    await deleteBatch(batch);
  }
};
