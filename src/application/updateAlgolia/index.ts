import type { DynamoDBStreamEvent } from "aws-lambda";
import { saveCompanyInAlgolia } from "../../infrastructure/companiesIndex";
import type { Company } from "../../infrastructure/companiesTable/types";

export const handler = async (event: DynamoDBStreamEvent): Promise<void> => {
  for (const record of event.Records) {
    if (["INSERT", "MODIFY"].includes(record.eventName!)) {
      const company: Company = record.dynamodb!.NewImage! as unknown as Company;

      await saveCompanyInAlgolia(company);
    }
  }
};
