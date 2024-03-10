import path from "node:path";
import { fileURLToPath } from "node:url";
import { parentPort, workerData } from "node:worker_threads";

import { getClosestSnapshot } from "./lib/wayback.js";
import { WorkerData, WorkerMessage } from "./types/index.js";
import { checkDomainHtml } from "./utils/check-html.js";
import { cleanDomain } from "./utils/index.js";
import { logger } from "./utils/logger.js";
import { readFirstColumnCsv, readFirstColumnXlsx } from "./utils/read-files.js";
import { serializeArrayToCsv } from "./utils/write-files.js";

const { filePath, mode, domainRegex, contentRegex, timeout, fileType } =
  workerData as WorkerData;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

logger.info({
  msg: "Processing domains file",
  filePath,
  fileType,
});

const data = (
  fileType === ".csv"
    ? await readFirstColumnCsv(filePath)
    : await readFirstColumnXlsx(filePath)
).map((x) => cleanDomain(x));

const filterRegExForDomain = new RegExp(domainRegex, "i");
const filterRegExForWayBack = new RegExp(contentRegex, "i");

async function filterByDomain(data: string[]): Promise<string[]> {
  const filtered = data.filter((x) => x && filterRegExForDomain.test(x));

  const fileName = `data-${Date.now()}_domains.csv`;
  const filePath = path.join(__dirname, fileName);

  await serializeArrayToCsv(filtered, filePath);

  parentPort?.postMessage({
    type: "domain",
    filePath: filePath,
  } as WorkerMessage);

  return filtered;
}

logger.info({
  timeout,
});

async function filterByContent(data: string[]) {
  const fileName = `data-${Date.now()}_wayback.csv`;
  const filePath = path.join(__dirname, fileName);
  const filtered: string[] = [];

  for (const domain of data) {
    await sleep(timeout);

    const snapshot = await getClosestSnapshot(domain);
    if (snapshot) {
      const isValid = await checkDomainHtml(snapshot, filterRegExForWayBack);
      logger.debug({
        domain: domain,
        found: isValid,
        step: "wayback",
      });
      isValid && filtered.push(domain);
    } else {
      logger.debug({
        domain: domain,
        msg: "Снимок не найден",
        step: "wayback",
      });
    }
  }

  await serializeArrayToCsv(filtered, filePath);

  parentPort?.postMessage({
    type: "content",
    filePath: filePath,
  } as WorkerMessage);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

switch (mode) {
  case "a":
    await filterByDomain(data);
    await filterByContent(data);
    break;

  case "b":
    // eslint-disable-next-line
    const filtered = await filterByDomain(data);
    await filterByContent(filtered);
    break;

  case "c":
    await filterByContent(data);
    break;

  default:
    throw new Error("Invalid mode value");
}
