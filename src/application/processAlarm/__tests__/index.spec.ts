import type { SQSRecord } from "aws-lambda";
import type { MockInstance } from "vitest";
import { sendMessage } from "../../../infrastructure/telegramBot";
import type { CloudWatchAlarmNotification } from "../../../infrastructure/utils/aws/alarm/types";
import { getAlarmName, handler } from "../index";
import { getAlarmFixture } from "./fixtures/getAlarm";

vi.mock("../../../infrastructure/telegramBot");

describe("processAlarm", () => {
  describe("getAlarmName", () => {
    it("should return the stripped alarm name", () => {
      const alarm: CloudWatchAlarmNotification = getAlarmFixture();

      expect(getAlarmName(alarm)).toEqual("UpdateAlgoliaDLQAlarmCD94D974");
    });
  });

  describe("handler", () => {
    let sendMessageMock: MockInstance<typeof sendMessage>;

    beforeEach(() => {
      sendMessageMock = vi.mocked(sendMessage);
    });

    afterEach(vi.resetAllMocks);

    it("should send a Telegram message when the alarm enters ALARM", async () => {
      const alarm: CloudWatchAlarmNotification = {
        ...getAlarmFixture(),
        NewStateValue: "ALARM",
        NewStateReason:
          "Threshold Crossed: 1 datapoint [1.0 (27/09/26 14:19:00)] was greater than or equal to the threshold (1.0).",
        OldStateValue: "OK"
      };

      await handler({
        Records: [
          {
            body: JSON.stringify(alarm)
          } as SQSRecord
        ]
      });

      expect(sendMessageMock).toHaveBeenNthCalledWith(
        1,
        "Alarm UpdateAlgoliaDLQAlarmCD94D974 is in ALARM. Reason: Threshold Crossed: 1 datapoint [1.0 (27/09/26 14:19:00)] was greater than or equal to the threshold (1.0)."
      );
    });

    it("should not send a Telegram message when the alarm returns to OK", async () => {
      const alarm: CloudWatchAlarmNotification = getAlarmFixture();

      await handler({
        Records: [
          {
            body: JSON.stringify(alarm)
          } as SQSRecord
        ]
      });

      expect(sendMessageMock).not.toHaveBeenCalled();
    });
  });
});
