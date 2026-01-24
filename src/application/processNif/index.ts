import type { SQSEvent } from "aws-lambda";

import type { CrawledData } from "../../infrastructure/crawler";
import { crawlCompany } from "../../infrastructure/crawler";
import { saveCompany } from "../../infrastructure/nifCategoryTable";

export interface ProcessNifMessage {
  nif: number;
}

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const { nif }: ProcessNifMessage = JSON.parse(record.body);

    const company: CrawledData | undefined = await crawlCompany(nif);
    if (company?.category !== undefined) {
      await saveCompany(nif, company.name, company.category);
    }
  }
};
