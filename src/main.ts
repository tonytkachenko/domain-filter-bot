#!/usr/bin/env tsx

import { createBot } from "@/bot/index.js";
import { config } from "@/config/index.js";
import { logger } from "@/utils/index.js";
import { onShutdown } from "node-graceful-shutdown";

try {
  const bot = createBot(config.BOT_TOKEN);

  onShutdown(async () => {
    logger.info("Shutdown");
    await bot.stop();
  });

  await bot.start({
    onStart: ({ username }) =>
      logger.info({
        msg: "Bot started",
        username,
      }),
  });
} catch (error) {
  logger.error(error);
  process.exit(1);
}
