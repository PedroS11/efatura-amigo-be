import type { SQSEvent } from "aws-lambda";

import { crawlCategory } from "../../infrastructure/crawler";
import { saveCategory } from "../../infrastructure/nifCategoryTable/nifCategoryTableRepository";
import type { Categories } from "../../infrastructure/nifCategoryTable/types";

export interface ProcessNifMessage {
  nif: string;
}

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const { nif }: ProcessNifMessage = JSON.parse(record.body);

    const category: Categories | undefined = await crawlCategory(nif);
    if (category) {
      await saveCategory(nif, category);
    }
  }
};
