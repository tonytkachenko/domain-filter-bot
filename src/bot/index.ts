import {
  Context,
  SessionData,
  createContextConstructor,
} from "@/bot/context.js";
import {
  checkerFeature,
  startFeature,
  topicsFeature,
  unhandledFeature,
} from "@/bot/features/index.js";
import { errorHandler } from "@/bot/handlers/index.js";
import { logger } from "@/utils/index.js";
import { conversations } from "@grammyjs/conversations";
import { hydrateFiles } from "@grammyjs/files";
import { hydrate } from "@grammyjs/hydrate";
import { hydrateReply, parseMode } from "@grammyjs/parse-mode";
import { BotConfig, StorageAdapter, Bot as TelegramBot, session } from "grammy";

import {
  createTopicConversation,
  topicsConversation,
} from "./conversations/index.js";
import { createMainMenuKeyboard } from "./keyboards/index.js";

type Options = {
  sessionStorage?: StorageAdapter<SessionData>;
  config?: Omit<BotConfig<Context>, "ContextConstructor">;
};

export function createBot(token: string, options: Options = {}) {
  const { sessionStorage } = options;
  const bot = new TelegramBot(token, {
    ...options.config,
    ContextConstructor: createContextConstructor({ logger }),
  });
  const protectedBot = bot.errorBoundary(errorHandler);

  bot.api.config.use(parseMode("HTML"));
  bot.api.config.use(hydrateFiles(bot.token));
  protectedBot.use(hydrateReply);
  protectedBot.use(hydrate());
  protectedBot.use(
    session({
      initial: () => ({
        lastFilePath: undefined,
        fileType: undefined,
      }),
      storage: sessionStorage,
    }),
  );

  // Conversations
  protectedBot.use(conversations());

  protectedBot.hears("❌ Отмена", async (ctx) => {
    await ctx.conversation.exit();
    await ctx.reply("Операция отменена", {
      reply_markup: createMainMenuKeyboard(),
    });
  });

  protectedBot.use(createTopicConversation());
  protectedBot.use(topicsConversation());

  // Features
  protectedBot.use(startFeature);
  protectedBot.use(topicsFeature);
  protectedBot.use(checkerFeature);
  protectedBot.use(unhandledFeature);

  return bot;
}

export type Bot = ReturnType<typeof createBot>;
