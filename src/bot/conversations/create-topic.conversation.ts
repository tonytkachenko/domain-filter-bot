import { Context } from "@/bot/context.js";
import prisma from "@/lib/prisma.js";
import { Conversation, createConversation } from "@grammyjs/conversations";
import { Topic } from "@prisma/client";

import { CONVERSATIONS } from "../constants.js";
import {
  createCancelKeyboard,
  createMainMenuKeyboard,
} from "../keyboards/index.js";

export function createTopicConversation() {
  return createConversation(
    async (conversation: Conversation<Context>, ctx: Context) => {
      const item: Omit<Topic, "id"> = {
        name: "",
        domainRegex: "",
        contentRegex: "",
      };

      await ctx.reply("Название подборки:", {
        reply_markup: createCancelKeyboard(),
      });

      ctx = await conversation.waitFor("msg:text");
      if (ctx.has("msg:text")) {
        item.name = ctx.message?.text ?? "";
      }

      if (ctx.has("msg:text")) {
        await ctx.reply("Регулярное выражение для доменов:");
        ctx = await conversation.waitFor("msg:text");
        item.domainRegex = ctx.message?.text ?? "";
      }

      if (ctx.has("msg:text")) {
        await ctx.reply("Регулярное выражение для содержимого:");
        ctx = await conversation.waitFor("msg:text");
        item.contentRegex = ctx.message?.text ?? "";

        try {
          const topic = await prisma.topic.create({
            data: item,
          });

          await ctx.reply(`Подборка <b>${topic.name}</b> успешно добавлена!`, {
            reply_markup: createMainMenuKeyboard(),
          });
        } catch (error) {
          ctx.logger.error(error);
          await ctx.reply("Изменения не сохранены. Попробуйте еще раз", {
            reply_markup: createMainMenuKeyboard(),
          });
        }
      }
    },
    CONVERSATIONS.ADD_TOPIC,
  );
}
