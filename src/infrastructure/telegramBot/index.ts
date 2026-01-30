import { getEnvironmentVariable } from "../utils/getEnvironmentVariable";
import { getBotInstance } from "./service";

export const sendMessage = async (message: string): Promise<void> => {
  const bot = getBotInstance();

  await bot.sendMessage(getEnvironmentVariable("TELEGRAM_CHAT_ID"), message);
};
