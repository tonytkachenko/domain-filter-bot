import { parse } from "csv-parse";
import ExcelJS from "exceljs";
import fs from "node:fs";

export async function readFirstColumnCsv(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const results: string[] = [];
    const parser = parse({
      delimiter: ",",
      fromLine: 2,
    });

    fs.createReadStream(filePath)
      .pipe(parser)
      .on("data", (row) => {
        results.push(row[0]);
      })
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
}

export async function readFirstColumnXlsx(filename: string): Promise<any[]> {
  const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(filename, {});
  const firstColumn: any[] = [];

  for await (const worksheetReader of workbookReader) {
    for await (const row of worksheetReader) {
      const firstCell = row.getCell(1);
      firstColumn.push(firstCell.value);
    }
    break;
  }

  return firstColumn;
}
