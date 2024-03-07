import type { ConversationFlavor } from "@grammyjs/conversations";
import type { HydrateFlavor } from "@grammyjs/hydrate";
import type { ParseModeFlavor } from "@grammyjs/parse-mode";

import { Logger } from "@/utils/index.js";
import { FileFlavor } from "@grammyjs/files";
import { type Api, Context as DefaultContext, SessionFlavor } from "grammy";
import { Update, UserFromGetMe } from "grammy/types";

export type SessionData = {
  lastFilePath?: string;
  fileType?: string;
};

type ExtendedContextFlavor = {
  logger: Logger;
};

export type Context = ParseModeFlavor<
  FileFlavor<
    HydrateFlavor<
      DefaultContext &
        ExtendedContextFlavor &
        ConversationFlavor &
        SessionFlavor<SessionData>
    >
  >
>;

interface Dependencies {
  logger: Logger;
}

export function createContextConstructor({ logger }: Dependencies) {
  return class extends DefaultContext implements ExtendedContextFlavor {
    logger: Logger;

    constructor(update: Update, api: Api, me: UserFromGetMe) {
      super(update, api, me);

      this.logger = logger.child({
        update_id: this.update.update_id,
      });
    }
  } as unknown as new (update: Update, api: Api, me: UserFromGetMe) => Context;
}
