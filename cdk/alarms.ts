import { Duration, type Stack } from "aws-cdk-lib";
import { Alarm, ComparisonOperator } from "aws-cdk-lib/aws-cloudwatch";
import type { Queue } from "aws-cdk-lib/aws-sqs";

export const createUpdateAlgoliaDLQAlarm = (stack: Stack, updateAlgoliaDLQ: Queue): Alarm =>
  new Alarm(stack, "UpdateAlgoliaDLQAlarm", {
    metric: updateAlgoliaDLQ.metricApproximateNumberOfMessagesVisible({
      // Only 10 free metric alarms and must have period >= 60s
      period: Duration.minutes(1),
      statistic: "Maximum"
    }),
    threshold: 1,
    evaluationPeriods: 1,
    comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD
  });
