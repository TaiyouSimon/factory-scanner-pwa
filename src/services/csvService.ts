import Papa from "papaparse";

export interface CsvRow {
  "Drawing number": string;
  "Product name": string;
  "Client name": string;
  URL: string;
  [key: string]: string;
}

export const parseCSV = async (filePath: string): Promise<CsvRow[]> => {
  try {
    const response = await fetch(filePath);
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse(csvText as any, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length) {
            reject(results.errors[0]);
          } else {
            resolve(results.data as CsvRow[]);
          }
        },
      });
    });
  } catch (error) {
    console.error("Error parsing CSV:", error);
    throw error;
  }
};

export const findMatchingRow = (
  data: CsvRow[],
  zuban: string
): CsvRow | undefined => {
  return data.find((row) => row["Drawing number"] === zuban);
};
