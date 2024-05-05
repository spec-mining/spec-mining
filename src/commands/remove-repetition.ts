import fs from "fs";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";

interface CsvRecord {
  [key: string]: string;
}

export const removeRepetition = async (inFilePath: string, uniqueFieldName: string, mergeFieldNames: Array<string> = []) => {
  console.log('Removing Repetition in ', inFilePath);
  let headersDetected = false;
  let csvHeaders: { id: string; title: string }[] = [];

  const seenRecords = new Set<string>();
  const records: CsvRecord[] = [];
  let originalRecordCount = 0;

  return new Promise<void>((resolve, reject) => {
    fs.createReadStream(inFilePath)
      .pipe(csv())
      .on("headers", (headers: string[]) => {
        // Automatically determine headers from the input CSV
        if (!headersDetected && headers.length > 0) {
          headersDetected = true;
          csvHeaders = headers.map((header) => ({ id: header, title: header }));
        }
      })
      .on("data", (data: CsvRecord) => {
        originalRecordCount++;
        const uniqueFieldValue = data[uniqueFieldName];
        if (uniqueFieldValue && !seenRecords.has(uniqueFieldValue)) {
          seenRecords.add(uniqueFieldValue);
          records.push(data);
        } else {
          if (mergeFieldNames.length > 0) {
            const existingRecord = records.find((record) => record[uniqueFieldName] === uniqueFieldValue);
            if (existingRecord) {
              mergeFieldNames.forEach((fieldName) => {
                if (data[fieldName]) {
                  const existingValueList = existingRecord[fieldName].split('|');
                  if (!existingValueList.includes(data[fieldName])) {
                    existingValueList.push(data[fieldName]);
                    existingRecord[fieldName] = existingValueList.join('|');
                  }
                }
              });
            }
          }
        }
      })
      .on("end", () => {
        console.log(
          'Removed', originalRecordCount - records.length, 'duplicate records.'
        );
  
        if (csvHeaders.length > 0) {
          const csvWriter = createObjectCsvWriter({
            path: inFilePath,
            header: csvHeaders,
          });
  
          csvWriter
            .writeRecords(records) // returns a promise
            .then(() => {
                console.log('Processed', records.length, 'unique records.');
                resolve()
              }
            )
            .catch((err) => {
              console.error("Error writing CSV file:", err)
            });
        } else {
          console.error("Failed to write: No headers found in the CSV file.");
        }
      });
  })
};
