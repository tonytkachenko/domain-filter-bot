import { ErrorHandler } from "grammy";

import { Context } from "../context.js";

export const errorHandler: ErrorHandler<Context> = (error) => {
  const { ctx } = error;

  ctx.logger.error({
    err: error.error,
  });
};
