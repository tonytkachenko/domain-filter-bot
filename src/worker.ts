import path from "node:path";
import { fileURLToPath } from "node:url";
import { parentPort, workerData } from "node:worker_threads";

import { getClosestSnapshot } from "./lib/wayback.js";
import { WorkerData, WorkerMessage, WorkingMode } from "./types/index.js";
import {
  checkDomainHtml,
  cleanDomain,
  logger,
  readFirstColumnCsv,
  readFirstColumnXlsx,
  serializeArrayToCsv,
} from "./utils/index.js";

const { filePath, mode, domainRegex, contentRegex, timeout, fileType } =
  workerData as WorkerData;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

logger.info({
  msg: "Processing file",
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

switch (mode) {
  case WorkingMode.Full:
    await filterByDomain(data);
    await filterByContent(data);
    break;

  case WorkingMode.Sequential:
    await filterByContent(await filterByDomain(data));
    break;

  case WorkingMode.ByContent:
    await filterByContent(data);
    break;

  case WorkingMode.ByDomain:
    await filterByDomain(data);
    break;

  default:
    throw new Error("Invalid mode value");
}

async function filterByDomain(data: string[]): Promise<string[]> {
  logger.info({
    msg: "Filtering by domain",
  });

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

async function filterByContent(data: string[]): Promise<string[]> {
  logger.info({
    msg: "Filtering by content",
  });

  const fileName = `data-${Date.now()}_wayback.csv`;
  const filePath = path.join(__dirname, fileName);
  const filtered: string[] = [];

  for (const domain of data) {
    const snapshot = await getClosestSnapshot(domain);
    if (snapshot) {
      const isValid = await checkDomainHtml(snapshot, filterRegExForWayBack);
      logger.debug({
        domain: domain,
        found: isValid,
        snapshot,
      });

      if (isValid) {
        filtered.push(domain);
      }
    } else {
      logger.debug({
        domain: domain,
        found: false,
        msg: "Snapshot not found",
      });
    }

    await sleep(timeout);
  }

  await serializeArrayToCsv(filtered, filePath);

  parentPort?.postMessage({
    type: "content",
    filePath: filePath,
  } as WorkerMessage);

  return filtered;
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
