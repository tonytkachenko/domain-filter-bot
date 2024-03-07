import type { Context } from "@/bot/context.js";

import { CONVERSATIONS } from "@/bot/constants.js";
import { isAdmin } from "@/bot/filters/is-admin.js";
import { logHandle } from "@/bot/helpers/logging.js";
import { createCancelKeyboard } from "@/bot/keyboards/index.js";
import { Composer } from "grammy";
import { extname } from "node:path";

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isAdmin);

feature.on(":document", logHandle("command-document"), async (ctx) => {
  try {
    const file = await ctx.getFile();
    const path = await file.download();
    const type = ctx.message.document.file_name || "";
    ctx.session.lastFilePath = path;
    ctx.session.fileType = extname(type);

    await ctx.reply("Файл получен", {
      reply_markup: createCancelKeyboard(),
    });

    await ctx.conversation.enter(CONVERSATIONS.RUN_CHECKER);
  } catch (error) {
    await ctx.reply(
      "Ошибка получения файла. Возможно он слишком большой для бота (> 20 Мб). Попробуйте разбить на части",
    );
  }
});

export { composer as checkerFeature };
