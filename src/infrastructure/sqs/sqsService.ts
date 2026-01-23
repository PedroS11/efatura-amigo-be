import { SendMessageCommand, SQSClient } from "@aws-sdk/client-sqs";

let client: SQSClient | undefined;

export const getClient = (): SQSClient => {
  if (!client) client = new SQSClient();
  return client;
};

export const sendMessage = async (message: unknown, queue: string): Promise<void> => {
  await getClient().send(
    new SendMessageCommand({
      MessageBody: JSON.stringify(message),
      QueueUrl: queue
    })
  );
};
