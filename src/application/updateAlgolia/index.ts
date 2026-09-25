import type { DynamoDBRecord, SQSEvent } from "aws-lambda";
import { removeCompanyFromAlgolia, saveCompanyInAlgolia } from "../../infrastructure/companiesIndex";
import type { Company } from "../../infrastructure/companiesTable/types";
import { unmarshallRecord } from "../../infrastructure/utils/aws/dynamo/utils";

export const handler = async (event: SQSEvent): Promise<void> => {
  for (const record of event.Records) {
    const dynamoDbStream: DynamoDBRecord = JSON.parse(record.body);
    if (["INSERT", "MODIFY"].includes(dynamoDbStream.eventName!)) {
      const company: Company = unmarshallRecord<Company>(dynamoDbStream.dynamodb?.NewImage);

      await saveCompanyInAlgolia(company);
    } else if (dynamoDbStream.eventName === "REMOVE") {
      const company: Company = unmarshallRecord<Company>(dynamoDbStream.dynamodb?.OldImage);

      await removeCompanyFromAlgolia(company.nif);
    }
  }
};
