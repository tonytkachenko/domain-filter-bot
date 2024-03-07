import type { Context } from "@/bot/context.js";

import { isAdmin } from "@/bot/filters/is-admin.js";
import { logHandle } from "@/bot/helpers/logging.js";
import prisma from "@/lib/prisma.js";
import { Composer, InlineKeyboard } from "grammy";

import { CONVERSATIONS } from "../constants.js";
import { chunk } from "../helpers/keyboard.js";
import {
  createTopicAddKeyboard,
  createTopicDeleteKeyboard,
} from "../keyboards/index.js";

const composer = new Composer<Context>();

const feature = composer.chatType("private").filter(isAdmin);

feature.hears("Добавить", logHandle("topic-create"), async (ctx) => {
  await ctx.conversation.enter(CONVERSATIONS.ADD_TOPIC);
});

feature.callbackQuery(
  "add_topic",
  logHandle("topic-create-callback"),
  async (ctx) => {
    await ctx.conversation.enter(CONVERSATIONS.ADD_TOPIC);
  },
);

feature.callbackQuery(/topic_\d+/, async (ctx) => {
  const topicId = Number(ctx.callbackQuery.data.slice(6));
  const topic = await prisma.topic.findUnique({
    where: {
      id: topicId,
    },
  });

  if (!topic) {
    return await ctx.answerCallbackQuery({
      cache_time: 10,
      show_alert: true,
      text: "Тематика не найдена!",
    });
  }

  await ctx.reply(`📒 Тематика: <b>${topic.name}</b>

🟠 <b>Фильтр доменов:</b> <code>${topic.domainRegex}</code>`);

  await ctx.reply(
    `🟢 <b>Фильтр контента:</b> <code>${topic.contentRegex}</code>`,
    {
      reply_markup: createTopicDeleteKeyboard(topic.id),
    },
  );

  await ctx.answerCallbackQuery();
});

feature.callbackQuery(/delete_\d+/, async (ctx) => {
  const topicId = Number(ctx.callbackQuery.data.slice(7));

  try {
    const topic = await prisma.topic.delete({
      where: {
        id: topicId,
      },
    });
    await ctx.reply(`Тематика <b>${topic.name}</b> удалена!`);
    await ctx.editMessageReplyMarkup();
    await ctx.answerCallbackQuery();
  } catch (error) {
    ctx.logger.error(error);

    return await ctx.answerCallbackQuery({
      cache_time: 10,
      show_alert: true,
      text: "Тематика не найдена!",
    });
  }
});

feature.hears("📒 Тематики", logHandle("topic-create"), async (ctx) => {
  const topics = await prisma?.topic.findMany();

  if (!topics || topics.length === 0) {
    await ctx.reply("Сохраненные тематики не найдены. Добавить?", {
      reply_markup: createTopicAddKeyboard(),
    });
    return;
  }

  const keyboard = InlineKeyboard.from([
    ...chunk(
      topics.map((topic) => ({
        text: topic.name,
        callback_data: `topic_${topic.id}`,
      })),
      2,
    ),
    [
      {
        text: "Добавить",
        callback_data: "add_topic",
      },
    ],
  ]);

  return ctx.reply("Список сохраненных тематик:", {
    reply_markup: keyboard,
  });
});

export { composer as topicsFeature };
