import fs from 'fs';
import { createObjectCsvWriter } from 'csv-writer';

async function main() {
    const outputDir = './data'; // Directory where JSON files are saved
    const outputFilePath = 'stackoverflow_issues.csv'; // CSV output file path

    const csvWriterInstance = createObjectCsvWriter({
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
        ],
    });

    let records = [];

    // Read JSON files for search results, question bodies, and answer bodies
    const searchResults = JSON.parse(fs.readFileSync(`${outputDir}/search_results_1.json`));
    const questionBodies = JSON.parse(fs.readFileSync(`${outputDir}/question_bodies_1.json`));
    const answerBodies = JSON.parse(fs.readFileSync(`${outputDir}/answer_bodies_1.json`));

    searchResults.results.items.forEach(item => {
        const { question_id, title, body, score, view_count } = item;
        const questionObject = questionBodies.items.find(q => q.question_id === question_id);
        const questionBody = questionObject?.body || '';

        const answerObjects = answerBodies.find(a => a.items[0]?.question_id === question_id)?.items
        // sort them based on the score
        ?.sort((a, b) => b.score - a.score)
        // pick top 3
        ?.slice(0, 3);
        
        const answerBodiesFiltered = answerObjects?.map(a => a.body) || [];

        const record = {
            search_keywords: searchResults.searchKeywords, // Replace with actual search keywords
            issue_link: `https://stackoverflow.com/questions/${question_id}`,
            issue_title: title,
            issue_body: questionBody,
            issue_score: score,
            issue_views: view_count,
            answer_1: answerBodiesFiltered[0] || null,
            answer_2: answerBodiesFiltered[1] || null,
            answer_3: answerBodiesFiltered[2] || null
        };

        records.push(record);
    });

    await csvWriterInstance.writeRecords(records);
    console.log(`CSV file generated: ${outputFilePath}`);
}

main().catch(err => console.error(err));
