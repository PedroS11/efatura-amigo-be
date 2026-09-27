import { Duration, type Stack } from "aws-cdk-lib";
import { Queue } from "aws-cdk-lib/aws-sqs";

export const createUpdateAlgoliaQueues = (stack: Stack): Queue[] => {
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

export const createProcessAlarmQueues = (stack: Stack): Queue[] => {
  const dlq = new Queue(stack, "ProcessAlarmDLQ", {
    retentionPeriod: Duration.days(14)
  });

  const sqs = new Queue(stack, "ProcessAlarmSQS", {
    visibilityTimeout: Duration.seconds(30 * 6),
    deadLetterQueue: {
      queue: dlq,
      maxReceiveCount: 2
    }
  });

  return [sqs, dlq];
};
