import fs from 'fs';
import fetch from 'node-fetch';

const SEARCH_API_URL = 'https://api.stackexchange.com/2.3/search/advanced';
const QUESTION_API_URL = 'https://api.stackexchange.com/2.3/questions';
const ANSWER_API_URL = 'https://api.stackexchange.com/2.3/questions';

async function searchIssues(keywords, currentPage) {
    const params = new URLSearchParams({
        site: 'stackoverflow',
        q: keywords,
        page: currentPage,
        pagesize: 100,
        order: 'desc',
        sort: 'votes',
        answers: 1,
    });

    const response = await fetch(`${SEARCH_API_URL}?${params}`);
    return await response.json();
}

async function fetchQuestionBody(questionIds) {
    const params = new URLSearchParams({
        order: 'desc',
        sort: 'activity',
        site: 'stackoverflow',
        filter: 'withbody'
    });

    const response = await fetch(`${QUESTION_API_URL}/${questionIds.join(';')}?${params}`);
    return await response.json();
}

async function fetchAnswerBodies(questionIds) {
    const params = new URLSearchParams({
        order: 'desc',
        sort: 'activity',
        site: 'stackoverflow',
        filter: 'withbody'
    });

    const responses = await Promise.all(questionIds.map(id => fetch(`${ANSWER_API_URL}/${id}/answers?${params}`)));
    const data = await Promise.all(responses.map(response => response.json()));
    return data;
}

async function main() {
    const keywords = 'SciPy unexpected result'; // Replace with your desired keywords
    const outputDir = './data';
    const currentPage = 1; // Replace with the starting page

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }

    const searchResult = await searchIssues(keywords, currentPage);
    const jsonFilePath = `${outputDir}/search_results_${currentPage}.json`;
    fs.writeFileSync(jsonFilePath, JSON.stringify({results: searchResult, searchKeywords: keywords}));

    const questionIds = searchResult.items.map(item => item.question_id);
    const questionBodyResult = await fetchQuestionBody(questionIds);
    const questionBodyFilePath = `${outputDir}/question_bodies_${currentPage}.json`;
    fs.writeFileSync(questionBodyFilePath, JSON.stringify(questionBodyResult));

    const answerBodyResult = await fetchAnswerBodies(questionIds);
    const answerBodyFilePath = `${outputDir}/answer_bodies_${currentPage}.json`;
    fs.writeFileSync(answerBodyFilePath, JSON.stringify(answerBodyResult));

    console.log(`Step ${currentPage} completed.`);
}

main().catch(err => console.error(err));
