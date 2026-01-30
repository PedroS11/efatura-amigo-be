import type { Telegram } from "telegraf";
import { Telegraf } from "telegraf";

import { getEnvironmentVariable } from "../utils/getEnvironmentVariable";

let bot: Telegram;

export const getBotInstance = (): Telegram => {
  if (!bot) {
    const instance = new Telegraf(getEnvironmentVariable("TELEGRAM_BOT_TOKEN"));
    bot = instance.telegram;
  }
  return bot;
};
