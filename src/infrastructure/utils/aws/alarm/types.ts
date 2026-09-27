type AlarmState = "OK" | "ALARM" | "INSUFFICIENT_DATA";

interface AlarmDimension {
  name: string; // lowercase in this payload
  value: string;
}

interface MetricStat {
  metric: { namespace: string; name: string; dimensions: Record<string, string> };
  period: number;
  stat: string;
  unit?: string;
}

interface AlarmTrigger {
  // single-metric alarms
  MetricName?: string;
  Namespace?: string;
  StatisticType?: "Statistic" | "ExtendedStatistic";
  Statistic?: string; // e.g. "AVERAGE", "SUM", or "p99" for extended stats
  Unit?: string | null;
  Dimensions?: AlarmDimension[];
  Period?: number;
  // metric-math alarms use this instead of the fields above
  Metrics?: Array<{
    Id: string;
    Expression?: string;
    Label?: string;
    ReturnData: boolean;
    MetricStat?: MetricStat;
  }>;
  EvaluationPeriods: number;
  DatapointsToAlarm?: number;
  ComparisonOperator: string; // e.g. "GreaterThanThreshold"
  Threshold: number;
  TreatMissingData?: string;
  EvaluateLowSampleCountPercentile?: string;
}

export interface CloudWatchAlarmNotification {
  AlarmName: string;
  AlarmDescription: string | null;
  AWSAccountId: string;
  AlarmConfigurationUpdatedTimestamp: string;
  NewStateValue: AlarmState;
  NewStateReason: string;
  StateChangeTime: string;
  Region: string; // human-readable, e.g. "EU (Ireland)"
  AlarmArn: string;
  OldStateValue: AlarmState;
  OKActions: string[];
  AlarmActions: string[];
  InsufficientDataActions: string[];
  Trigger: AlarmTrigger;
}
