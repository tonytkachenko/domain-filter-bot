import { config } from "@/config/index.js";
import { isUserHasId } from "grammy-guard";

export const isAdmin = isUserHasId(...config.BOT_ADMINS);
