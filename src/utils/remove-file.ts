import fs from "node:fs/promises";

import { logger } from "./logger.js";

export async function removeFile(filePath: string) {
  try {
    await fs.unlink(filePath);
    logger.info({ msg: "File removed", path: filePath });
  } catch (err) {
    logger.warn({ msg: "Error removing file", path: filePath });
  }
}
