import { Duration, type Stack } from "aws-cdk-lib";
import { Queue } from "aws-cdk-lib/aws-sqs";

export const updateAlgoliaQueues = (stack: Stack): Queue[] => {
  const dlq = new Queue(stack, "UpdateAlgoliaDLQ", {
    retentionPeriod: Duration.days(14)
  });

  const sqs = new Queue(stack, "UpdateAlgoliaSQS", {
    visibilityTimeout: Duration.seconds(30 * 6),
    deadLetterQueue: {
      queue: dlq,
      maxReceiveCount: 2
    }
  });

  return [sqs, dlq];
};
