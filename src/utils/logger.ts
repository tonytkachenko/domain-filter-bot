import { pino } from "pino";

import { config } from "../config/index.js";

export const logger = pino({
  level: config.LOG_LEVEL,
  transport: {
    targets: [
      ...(config.isDev
        ? [
            {
              target: "pino-pretty",
              level: config.LOG_LEVEL,
              options: {
                ignore: "pid,hostname",
                colorize: true,
                translateTime: true,
              },
            },
          ]
        : [
            {
              target: "pino/file",
              level: config.LOG_LEVEL,
              options: {
                ignore: "pid",
              },
            },
          ]),
    ],
  },
});

export type Logger = typeof logger;
