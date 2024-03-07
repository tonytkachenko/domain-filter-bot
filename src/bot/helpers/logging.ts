import type { Context } from "@/bot/context.js";
import type { Middleware } from "grammy";
import type { Update } from "grammy/types";

export function getUpdateInfo(ctx: Context): Omit<Update, "update_id"> {
  // eslint-disable-next-line camelcase, @typescript-eslint/no-unused-vars
  const { update_id, ...update } = ctx.update;

  return update;
}

export function logHandle(id: string): Middleware<Context> {
  return (ctx, next) => {
    ctx.logger.info({
      msg: `handle ${id}`,
      ...(id.startsWith("unhandled") ? { update: getUpdateInfo(ctx) } : {}),
    });

    return next();
  };
}
