import type { SQSEvent } from "aws-lambda";
import { sendMessage } from "../../infrastructure/telegramBot";
import type { CloudWatchAlarmNotification } from "../../infrastructure/utils/aws/alarm/types";
import { getEnvironmentVariable } from "../../infrastructure/utils/getEnvironmentVariable";

const stackName = getEnvironmentVariable("STACK_NAME");

export const getAlarmName = (alarm: CloudWatchAlarmNotification): string =>
  alarm.AlarmName.substring(stackName.length + 1).split("-")?.[0];

export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const alarm = JSON.parse(record.body) as CloudWatchAlarmNotification;
    const alertName = getAlarmName(alarm);

    if (alarm.NewStateValue === "ALARM" || alarm.NewStateValue === "OK") {
      await sendMessage(`Alarm ${alertName} was triggered. Reason: ${alarm.NewStateReason}`);
    }
  }
};
