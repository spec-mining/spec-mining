import fs from "fs";
import csv from "csv-parser";
import { createObjectCsvWriter } from "csv-writer";

interface CsvRecord {
  [key: string]: string;
}

export const removeRepetition = (inFilePath: string) => {
  let headersDetected = false;
  let csvHeaders: { id: string; title: string }[] = [];

  const seenIssueLinks = new Set<string>();
  const records: CsvRecord[] = [];
  let originalRecordCount = 0;

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
      const issueLink = data.issue_link;
      if (issueLink && !seenIssueLinks.has(issueLink)) {
        seenIssueLinks.add(issueLink);
        records.push(data);
      }
    })
    .on("end", () => {
      console.log(
        `Removed ${originalRecordCount - records.length} duplicate records.`
      );

      if (csvHeaders.length > 0) {
        const csvWriter = createObjectCsvWriter({
          path: inFilePath,
          header: csvHeaders,
        });

        csvWriter
          .writeRecords(records) // returns a promise
          .then(() =>
            console.log(`Processed ${records.length} unique records.`)
          )
          .catch((err) => console.error("Error writing CSV file:", err));
      } else {
        console.error("Failed to write: No headers found in the CSV file.");
      }
    });
};
