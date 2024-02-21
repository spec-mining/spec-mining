import fs from 'fs';
import csv from 'csv-parser';
import sanitizeHtml from 'sanitize-html';
import { createObjectCsvWriter } from 'csv-writer';

// Function to sanitize HTML content
function sanitizeHTMLContent(htmlContent) {
    return sanitizeHtml(htmlContent, {
        allowedTags: [], // No allowed tags (remove all)
        allowedAttributes: {} // No allowed attributes (remove all)
    });
}

// Input and output file paths
const inputFilePath = 'stackoverflow_issues.csv';
const outputFilePath = 'sanitized_stackoverflow_issues.csv';

// Create CSV writer instance
const csvWriter = createObjectCsvWriter({
    path: outputFilePath,
    header: [
        { id: 'search_keywords', title: 'search_keywords' },
        { id: 'issue_link', title: 'issue_link' },
        { id: 'issue_title', title: 'issue_title' },
        { id: 'issue_body', title: 'issue_body' },
        { id: 'issue_score', title: 'issue_score' },
        { id: 'issue_views', title: 'issue_views' },
        { id: 'answer_1', title: 'answer_1' },
        { id: 'answer_2', title: 'answer_2' },
        { id: 'answer_3', title: 'answer_3' }
    ]
});

// Array to hold records
const records = [];

// Read CSV file and sanitize HTML content
fs.createReadStream(inputFilePath)
    .pipe(csv())
    .on('data', (data) => {
        // Sanitize issue body
        data.issue_body = sanitizeHTMLContent(data.issue_body);
        // Sanitize answers
        data.answer_1 = sanitizeHTMLContent(data.answer_1);
        data.answer_2 = sanitizeHTMLContent(data.answer_2);
        data.answer_3 = sanitizeHTMLContent(data.answer_3);
        // Push record to array
        records.push(data);
    })
    .on('end', () => {
        // Write sanitized data to new CSV file
        csvWriter.writeRecords(records)
            .then(() => {
                console.log(`Sanitized data has been written to ${outputFilePath}`);
            })
            .catch((error) => {
                console.error('Error writing CSV:', error);
            });
    });
