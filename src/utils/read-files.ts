import { parse } from "csv-parse";
import * as Excel from "exceljs";
import { createReadStream } from "node:fs";

export async function readFirstColumnCsv(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const results: string[] = [];
    const parser = parse({
      delimiter: ",",
      fromLine: 2,
    });

    createReadStream(filePath)
      .pipe(parser)
      .on("data", (row) => {
        results.push(row[0]); // Push the first column value
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

export async function readFirstColumnXlsx(filename: string): Promise<any[]> {
  const workbookReader = new Excel.stream.xlsx.WorkbookReader(filename, {});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const firstColumn: any[] = [];

  for await (const worksheetReader of workbookReader) {
    for await (const row of worksheetReader) {
      // Get the value of the first cell in the row
      const firstCell = row.getCell(1);
      firstColumn.push(firstCell.value);
    }
    break; // Only process the first worksheet
  }

  return firstColumn;
}
