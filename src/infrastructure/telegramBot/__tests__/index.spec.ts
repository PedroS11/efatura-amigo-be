import type { Telegram } from "telegraf";
import type { MockInstance } from "vitest";

import { sendMessage } from "../index";
import { getBotInstance } from "../service";

vi.mock("../service");

describe("TelegramBot", () => {
  let getBotInstanceMock: MockInstance;
  let sendMessageMock: MockInstance;

  beforeEach(() => {
    sendMessageMock = vi.fn();
    getBotInstanceMock = vi.mocked(getBotInstance).mockReturnValue({
      sendMessage: sendMessageMock
    } as unknown as Telegram);
  });

  afterEach(vi.resetAllMocks);

  describe("sendMessage", () => {
    it("should send a message to the bot", async () => {
      await sendMessage("MESSAGE");
      expect(getBotInstanceMock).toHaveBeenCalled();
      expect(sendMessageMock).toHaveBeenCalledWith("__TELEGRAM_CHAT_ID__", "MESSAGE");
    });
  });
});
