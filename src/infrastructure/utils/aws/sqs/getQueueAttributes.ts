import {
  GetQueueAttributesCommand,
  type GetQueueAttributesCommandInput,
  type GetQueueAttributesCommandOutput
} from "@aws-sdk/client-sqs";
import { getSQSClient } from "./utils";

export const getQueueAttributes = (
  queue: string,
  attributeNames: GetQueueAttributesCommandInput["AttributeNames"]
): Promise<GetQueueAttributesCommandOutput> => {
  const client = getSQSClient();

  return client.send(
    new GetQueueAttributesCommand({
      QueueUrl: queue,
      AttributeNames: attributeNames
    })
  );
};
