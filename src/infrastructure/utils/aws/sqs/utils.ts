import { SQSClient } from "@aws-sdk/client-sqs";

let client: SQSClient;

export const getSQSClient = () => {
  if (!client) {
    client = new SQSClient();
  }
  return client;
};
