import { CONVERSATIONS } from "@/bot/constants.js";
import { Context } from "@/bot/context.js";
import { config } from "@/config/index.js";
import prisma from "@/lib/prisma.js";
import { WorkerData, WorkerMessage, WorkingMode } from "@/types/index.js";
import { logger, removeFile } from "@/utils/index.js";
import { type Conversation, createConversation } from "@grammyjs/conversations";
import { InputFile, Keyboard } from "grammy";
import { Worker } from "node:worker_threads";

import {
  createFilterModeKeyboard,
  createTopicsKeyboard,
} from "../keyboards/index.js";

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
          logger.info({
            msg: "Filtered by domain",
          });
          await ctx.replyWithDocument(new InputFile(msg.filePath), {
            caption: "Домены отфильтрованы по названию",
          });
          await removeFile(msg.filePath);
          break;

        case "content":
          logger.info({
            msg: "Filtered by content",
          });
          await ctx.replyWithDocument(new InputFile(msg.filePath), {
            caption: "Домены отфильтрованы по содержимому",
          });
          await removeFile(msg.filePath);
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
      let mode = WorkingMode.ByDomain;
      let topicId = -1;

      await ctx.reply(
        "Как фильтровать домены? \n\n" +
          "<b>A</b> - по домену и по вебархиву\n" +
          "<b>B</b> - по домену и результат по вебархиву\n" +
          "<b>C</b> - только вебархив\n" +
          "<b>D</b> - только по домену",
        {
          reply_markup: createFilterModeKeyboard(),
        },
      );

      ctx = await conversation.waitForCallbackQuery(/variant_\d/);

      if (ctx.has("callback_query:data")) {
        await ctx.editMessageReplyMarkup();
        mode = Number(ctx.callbackQuery.data.slice(8));
      }

      const topics = await prisma?.topic.findMany();

      if (!topics || topics.length === 0) {
        await ctx.reply(
          "Сохраненные тематики не найдены. Сперва необходимо добавить как минимум один список",
        );
        return;
      }

      await ctx.reply("Выберите список для фильтрации", {
        reply_markup: createTopicsKeyboard(topics),
      });
      ctx = await conversation.waitForCallbackQuery(/topic_\d+/);

      if (ctx.has("callback_query:data")) {
        await ctx.editMessageReplyMarkup();
        topicId = Number(ctx.callbackQuery.data.slice(6));

        const topic = topics.find((x) => x.id === topicId);

        ctx.logger.info({
          filePath: ctx.session.lastFilePath,
        });

        await ctx.reply(
          "Файл поставлен в обработку! Пожалуйста, дождитесь окончания операции",
          {
            reply_markup: { remove_keyboard: true },
          },
        );

        createWorker(ctx, {
          filePath: ctx.session.lastFilePath!,
          fileType: ctx.session.fileType!,
          mode: mode,
          domainRegex: topic?.domainRegex ?? "()",
          contentRegex: topic?.contentRegex ?? "()",
          timeout: config.WAYBACK_TIMEOUT * 1000,
        });

        ctx.session = {};
      }
    },

    CONVERSATIONS.RUN_CHECKER,
  );
}
