import type { Context } from "@/bot/context.js";

import { logHandle } from "@/bot/helpers/logging.js";
import { Composer } from "grammy";

import { createMainMenuKeyboard } from "../keyboards/index.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.command("start", logHandle("command-start"), async (ctx) => {
  return ctx.reply(
    "Добро пожаловать. Бот запущен и ожидает дальнейших команд.",
    {
      reply_markup: createMainMenuKeyboard(),
    },
  );
});

export { composer as startFeature };
