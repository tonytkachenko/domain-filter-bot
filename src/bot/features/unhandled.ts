import { Context } from "@/bot/context.js";
import { logHandle } from "@/bot/helpers/index.js";
import { Composer } from "grammy";

const composer = new Composer<Context>();

const feature = composer.chatType("private");

feature.on("message", logHandle("unhandled-message"), (ctx) => {
  return ctx.reply("Я не понимаю эту команду");
});

feature.on("callback_query", logHandle("unhandled-callback-query"), (ctx) => {
  return ctx.answerCallbackQuery();
});

export { composer as unhandledFeature };
