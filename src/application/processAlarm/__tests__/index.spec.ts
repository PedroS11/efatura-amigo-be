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

    it("should process alarm and send a message to Telegram", async () => {
      const alarm: CloudWatchAlarmNotification = getAlarmFixture();

      await handler({
        Records: [
          {
            body: JSON.stringify(alarm)
          } as SQSRecord
        ]
      });

      expect(sendMessageMock).toHaveBeenNthCalledWith(
        1,
        "Alarm UpdateAlgoliaDLQAlarmCD94D974 was triggered. Reason: Threshold Crossed: 1 datapoint [0.0 (27/09/26 14:19:00)] was not greater than or equal to the threshold (1.0)."
      );
    });
  });
});
