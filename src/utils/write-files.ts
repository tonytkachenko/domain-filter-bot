import { stringify } from "csv-stringify";
import fs from "node:fs";

export function serializeArrayToCsv(data: string[], filePath: string) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filePath);

    const csvStream = stringify({
      header: false,
    });

    csvStream.on("error", reject);
    fileStream.on("error", reject);
    fileStream.on("finish", () => resolve(filePath));

    csvStream.pipe(fileStream);

    data.forEach((row) => csvStream.write([row]));
    csvStream.end();
  });
}
