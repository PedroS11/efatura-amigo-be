import type { DynamoDBRecord, SQSEvent } from "aws-lambda";
import { saveCompanyInAlgolia } from "../../infrastructure/companiesIndex";
import type { Company } from "../../infrastructure/companiesTable/types";
import { unmarshallRecord } from "../../infrastructure/utils/aws/dynamo/utils";
import { logMessage } from "../../infrastructure/utils/logger";

export const handler = async (event: SQSEvent): Promise<void> => {
  logMessage("event", JSON.stringify(event));
  for (const record of event.Records) {
    const dynamoDbStream: DynamoDBRecord = JSON.parse(record.body);
    if (["INSERT", "MODIFY"].includes(dynamoDbStream.eventName!)) {
      const company: Company = unmarshallRecord<Company>(dynamoDbStream.dynamodb?.NewImage);

      await saveCompanyInAlgolia(company);
    }
  }
};
