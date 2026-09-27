import type { SQSEvent } from "aws-lambda";
import type { CloudWatchAlarmNotification } from "../../infrastructure/utils/aws/alarm/types";

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const alarm = JSON.parse(record.body) as CloudWatchAlarmNotification;
    console.log(alarm.AlarmName, alarm.OldStateValue, "->", alarm.NewStateValue);
    console.log("ALARM", JSON.stringify(alarm));
  }
};
