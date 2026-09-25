import type { DynamoDBRecord, SQSEvent } from "aws-lambda";
import { saveCompanyInAlgolia } from "../../infrastructure/companiesIndex";
import type { Company } from "../../infrastructure/companiesTable/types";
import { logMessage } from "../../infrastructure/utils/logger";

export const handler = async (event: SQSEvent): Promise<void> => {
  logMessage("event", JSON.stringify(event));
  for (const record of event.Records) {
    const dynamoDbStream: DynamoDBRecord = JSON.parse(record.body);
    if (["INSERT", "MODIFY"].includes(dynamoDbStream.eventName!)) {
      const company: Company = dynamoDbStream.dynamodb!.NewImage! as unknown as Company;

      await saveCompanyInAlgolia(company);
    }
  }
};
