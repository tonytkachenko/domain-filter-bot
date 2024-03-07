import { CONVERSATIONS } from "@/bot/constants.js";
import { Context } from "@/bot/context.js";
import { config } from "@/config/index.js";
import prisma from "@/lib/prisma.js";
import { WorkerData, WorkerMessage } from "@/types/index.js";
import { logger } from "@/utils/index.js";
import { type Conversation, createConversation } from "@grammyjs/conversations";
import { InlineKeyboard, InputFile } from "grammy";
import { Worker } from "node:worker_threads";

import { chunk } from "../helpers/index.js";
import { createFilterModeKeyboard } from "../keyboards/index.js";

function createWorker(ctx: Context, options: WorkerData) {
  const worker = new Worker("./dist/src/worker.js", {
    workerData: {
      ...options,
    },
  });

  worker.on("message", async (msg: WorkerMessage) => {
    try {
      switch (msg.type) {
        case "error":
          await ctx.reply("При обработке файла возникла ошибка.");
          break;
        case "domain":
          await ctx.replyWithDocument(new InputFile(msg.filePath), {
            caption: "Домены отфильтрованы по названию",
          });
          break;
        case "content":
          await ctx.replyWithDocument(new InputFile(msg.filePath), {
            caption: "Домены отфильтрованы по содержимому",
          });
          break;
      }
    } catch (error) {
      await ctx.reply(
        "Обработка завершена. Список доменов пуст - все отфильтрованы.",
      );
    }
  });

  worker.on("error", (err) => {
    logger.error(err);
    ctx.reply("Возникла ошибка обработки файла. Попробуйте еще раз");
  });

  worker.on("exit", () => {
    logger.info({
      msg: "Process finished",
    });
  });
}

export function topicsConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      let mode = "";
      let topicId = -1;

      await ctx.reply("Как фильтровать домены?", {
        reply_markup: createFilterModeKeyboard(),
      });

      ctx = await conversation.waitForCallbackQuery(/variant_\w/);
      if (ctx.has("callback_query:data")) {
        await ctx.editMessageReplyMarkup();
        mode = ctx.callbackQuery.data.slice(8);
      }

      const topics = await prisma?.topic.findMany();

      if (!topics || topics.length === 0) {
        await ctx.reply(
          "Сохраненные тематики не найдены. Сперва необходимо добавить как минимум один список",
        );
        return;
      }

      const keyboard = InlineKeyboard.from(
        chunk(
          topics.map((topic) => ({
            text: topic.name,
            callback_data: `topic_${topic.id}`,
          })),
          2,
        ),
      );

      await ctx.reply("Выберите список для фильтрации", {
        reply_markup: keyboard,
      });
      ctx = await conversation.waitForCallbackQuery(/topic_\d+/);

      if (ctx.has("callback_query:data")) {
        await ctx.editMessageReplyMarkup();
        topicId = Number(ctx.callbackQuery.data.slice(6));

        const topic = topics.find((x) => x.id === topicId);

        ctx.logger.info({
          filePath: ctx.session.lastFilePath,
        });

        createWorker(ctx, {
          filePath: ctx.session.lastFilePath!,
          fileType: ctx.session.fileType!,
          mode: mode,
          domainRegex: topic?.domainRegex ?? "()",
          contentRegex: topic?.contentRegex ?? "()",
          timeout: config.WAYBACK_TIMEOUT * 1000,
        });

        await ctx.reply(
          "Файл поставлен в обработку! Пожалуйста, дождитесь окончания операции",
        );
        ctx.session = {};
      }
    },
    CONVERSATIONS.RUN_CHECKER,
  );
}
