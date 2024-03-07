import { parse } from "csv-parse";
import { createReadStream, readFileSync } from "node:fs";
import * as xlsx from "node-xlsx";

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
export function readFirstColumnXlsx(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    try {
      // Чтение файла в буфер
      const fileBuffer = readFileSync(filePath);

      // Парсинг файла
      const sheets = xlsx.parse(fileBuffer);

      // Предполагаем, что данные находятся на первом листе
      const sheetData = sheets[0].data;

      // Извлечение первого столбца
      const firstColumnData = sheetData.map((row) => row[0]);

      resolve(firstColumnData);
    } catch (error) {
      reject(error);
    }
  });
}
