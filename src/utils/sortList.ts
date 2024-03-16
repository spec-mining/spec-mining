import { createObjectCsvWriter } from 'csv-writer';
import csv from 'csv-parser';
import fs from 'fs-extra';

interface CsvRecord {
    [key: string]: string;
}

const defaultSortFunction = (asc: boolean, sortField: string) => (a: CsvRecord, b: CsvRecord) => {
    if (asc === true) {
        if (Number.parseInt(a[sortField]) < Number.parseInt(b[sortField])) {
            return -1;
        }
        if (Number.parseInt(a[sortField]) > Number.parseInt(b[sortField])) {
            return 1;
        }
        return 0;
    } else {
        if (Number.parseInt(a[sortField]) > Number.parseInt(b[sortField])) {
            return -1;
        }
        if (Number.parseInt(a[sortField]) < Number.parseInt(b[sortField])) {
            return 1;
        }
        return 0;
    }
}

export const sortList = async (inFilePath: string, options: {
    sortField: string,
    asc?: boolean,
    customFunction?: (a: CsvRecord, b: CsvRecord) => number
}) => {
    console.log('Sorting list in ', inFilePath);
    let headersDetected = false;
    let csvHeaders: { id: string; title: string }[] = [];
    
    const records: CsvRecord[] = [];
    
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
            records.push(data);
        })
        .on("end", () => {
            records.sort(options.customFunction || defaultSortFunction(options.asc === true, options.sortField));
    
            if (csvHeaders.length > 0) {
            const csvWriter = createObjectCsvWriter({
                path: inFilePath,
                header: csvHeaders,
            });
    
            csvWriter
                .writeRecords(records) // returns a promise
                .then(() => {
                    console.log(`Sorted ${records.length} records.`)
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
}