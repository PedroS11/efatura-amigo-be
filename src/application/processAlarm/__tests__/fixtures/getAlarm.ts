import type { CloudWatchAlarmNotification } from "../../../../infrastructure/utils/aws/alarm/types";

export const getAlarmFixture = (): CloudWatchAlarmNotification => ({
  AlarmName: "EfaturaAmigoBeStack-alarm-UpdateAlgoliaDLQAlarmCD94D974-iiV6b0HXpBJZ",
  AlarmDescription: null,
  AWSAccountId: "566348719618",
  AlarmConfigurationUpdatedTimestamp: "2026-09-27T14:15:44.784+0000",
  NewStateValue: "OK",
  NewStateReason:
    "Threshold Crossed: 1 datapoint [0.0 (27/09/26 14:19:00)] was not greater than or equal to the threshold (1.0).",
  StateChangeTime: "2026-09-27T14:21:19.895+0000",
  Region: "EU (London)",
  AlarmArn:
    "arn:aws:cloudwatch:eu-west-2:566348719618:alarm:EfaturaAmigoBeStack-alarm-UpdateAlgoliaDLQAlarmCD94D974-iiV6b0HXpBJZ",
  OldStateValue: "INSUFFICIENT_DATA",
  OKActions: ["arn:aws:sns:eu-west-2:566348719618:EfaturaAmigoBeStack-alarm-AlarmsTopicABBEC356-Dxy7oI2cpZ9t"],
  AlarmActions: ["arn:aws:sns:eu-west-2:566348719618:EfaturaAmigoBeStack-alarm-AlarmsTopicABBEC356-Dxy7oI2cpZ9t"],
  InsufficientDataActions: [],
  Trigger: {
    MetricName: "ApproximateNumberOfMessagesVisible",
    Namespace: "AWS/SQS",
    StatisticType: "Statistic",
    Statistic: "MAXIMUM",
    Unit: null,
    Dimensions: [
      {
        value: "EfaturaAmigoBeStack-alarm-UpdateAlgoliaDLQ486265FD-HE3OojSVNtuC",
        name: "QueueName"
      }
    ],
    Period: 60,
    EvaluationPeriods: 1,
    ComparisonOperator: "GreaterThanOrEqualToThreshold",
    Threshold: 1,
    TreatMissingData: "",
    EvaluateLowSampleCountPercentile: ""
  }
});
