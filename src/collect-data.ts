import fs from 'fs';
import fetch from 'node-fetch';
import sanitizeHtml from 'sanitize-html';
import { createObjectCsvWriter } from 'csv-writer';

import { searchPhrases } from './constants/search-phrases'
import path from 'path';

const SEARCH_API_URL = 'https://api.stackexchange.com/2.3/search/advanced';
const QUESTION_API_URL = 'https://api.stackexchange.com/2.3/questions';
const ANSWER_API_URL = 'https://api.stackexchange.com/2.3/questions';

interface StackoverflowUser {
    account_id: number,
    reputation: number,
    user_id: number,
    user_type: string,
    profile_image: string,
    display_name: string,
    link: string
}

interface StackoverflowAnswer {
    owner: StackoverflowUser,
    is_accepted: boolean,
    score: number,
    last_activity_date: number,
    creation_date: number,
    answer_id: number,
    question_id: number,
    content_license: string,
    body: string
}

interface AnswerBodyResult {
    items: Array<StackoverflowAnswer>,
    "has_more": boolean,
    "quota_max": number,
    "quota_remaining": number
}

interface StackoverflowSearchResult {
    tags: Array<string>,
    owner: StackoverflowUser,
    is_answered: boolean,
    view_count: number,
    accepted_answer_id: number,
    answer_count: number,
    score: number,
    last_activity_date: number,
    creation_date: number,
    last_edit_date: number,
    question_id: number,
    content_license: string,
    link: string,
    title: string
}

interface SearchResult {
    items: Array<StackoverflowSearchResult>,
    "has_more": boolean,
    "quota_max": number,
    "quota_remaining": number
}

interface StackoverflowQuestion {
    tags: Array<string>,
    owner: StackoverflowUser,
    is_answered: boolean,
    view_count: number,
    answer_count: number,
    score: number,
    last_activity_date: number,
    creation_date: number,
    last_edit_date: number,
    question_id: number,
    content_license: string,
    link: string,
    title: string,
    body: string
}

interface QuestionBodyResult {
    items: Array<StackoverflowQuestion>,
    "has_more": boolean,
    "quota_max": number,
    "quota_remaining": number
}


interface SearchResults {
    searchResult: SearchResult,
    questionBodyResult: QuestionBodyResult,
    answerBodyResult: AnswerBodyResult
}

const searchIssues = async (searchPhrase: string, currentPage: string): Promise<SearchResult> => {
    const params = new URLSearchParams({
        site: 'stackoverflow',
        q: searchPhrase,
        page: currentPage,
        pagesize: '100',
        order: 'desc',
        sort: 'votes',
        answers: '1',
    });

    return (await fetch(`${SEARCH_API_URL}?${params}`)).json() as Promise<SearchResult>;
}

const fetchQuestionBody = async (questionIds: Array<number>): Promise<QuestionBodyResult> => {
    const params = new URLSearchParams({
        order: 'desc',
        sort: 'activity',
        site: 'stackoverflow',
        filter: 'withbody'
    });

    return (await fetch(`${QUESTION_API_URL}/${questionIds.join(';')}?${params}`)).json() as Promise<QuestionBodyResult>;
}

const fetchAnswerBodies = async (questionIds: Array<number>): Promise<AnswerBodyResult> => {
    const params = new URLSearchParams({
        order: 'desc',
        sort: 'activity',
        site: 'stackoverflow',
        filter: 'withbody'
    });

    console.log('Fetching answer bodies for question ids:', questionIds.join(';'));
    console.log('using link:', `${ANSWER_API_URL}/${questionIds.join(';')}/answers?${params}`);
    return (await fetch(`${ANSWER_API_URL}/${questionIds.join(';')}/answers?${params}`)).json() as Promise<AnswerBodyResult>;
}

const sanitizeHTMLContent = (htmlContent: string): string => {
    return sanitizeHtml(htmlContent, {
        allowedTags: [], // No allowed tags (remove all)
        allowedAttributes: {} // No allowed attributes (remove all)
    });
}

const fetchData = async (searchPhrase: string, currentPage: string): Promise<SearchResults> => {
    const searchResult = await searchIssues(searchPhrase, currentPage.toString());

    const questionIds = searchResult.items.map((item: StackoverflowSearchResult) => item.question_id);

    if (questionIds.length === 0) {
        console.log('No questions found for search phrase:', searchPhrase);
        return {
            searchResult,
            questionBodyResult: {
                items: [],
                has_more: false,
                quota_max: 0,
                quota_remaining: 0
            },
            answerBodyResult: {
                items: [],
                has_more: false,
                quota_max: 0,
                quota_remaining: 0
            }
        }
    }

    const questionBodyResult = await fetchQuestionBody(questionIds);

    const answerBodyResult = await fetchAnswerBodies(questionIds);
    
    console.log('remaining search quota:', searchResult.quota_remaining)
    console.log('remaining question quota:', questionBodyResult.quota_remaining)
    console.log('remaining answer quota:', answerBodyResult.quota_remaining)

    console.log('question items:', questionBodyResult.items && questionBodyResult.items.length)
    console.log('answer items:', answerBodyResult.items && answerBodyResult.items.length)
    
    if (!questionBodyResult.items) {
        console.log('No question body results: ', questionBodyResult);
    }
    
    if (!answerBodyResult.items) {
        console.log('No search results: ', answerBodyResult);
    }

    return {
        searchResult,
        questionBodyResult,
        answerBodyResult
    }
}

const sanitizeData = ({
    answerBodyResult,
    questionBodyResult,
    searchResult
}: SearchResults): SearchResults => {
    // sanitize data

    return {
        searchResult: searchResult,
        questionBodyResult: {
            ...questionBodyResult,
            items: questionBodyResult.items.map((item): StackoverflowQuestion => ({...item, body: sanitizeHTMLContent(item.body)})),
        },
        answerBodyResult: {
            ...answerBodyResult,
            items: answerBodyResult.items.map((answer) => ({...answer, body: sanitizeHTMLContent(answer.body)})),
        }
    }
}

const saveData = async (
    outFile: string,
    searchPhrase: string,
    { answerBodyResult, questionBodyResult, searchResult}: SearchResults
) => {
    const fileExists = fs.existsSync(outFile);
    const base = path.dirname(outFile);

    if (!fs.existsSync(base)) {
        fs.mkdirSync(base);
    }

    const csvWriterInstance = createObjectCsvWriter({
        path: outFile,
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
        append: fileExists
    });

    const records: any[] = searchResult.items.map((item: StackoverflowSearchResult) => {
        const { question_id, title, score, view_count } = item;
        const questionObject = questionBodyResult.items.find((q: StackoverflowQuestion) => q.question_id === question_id);
        const questionBody = questionObject?.body || '';

        const answerObjects = answerBodyResult.items.filter((a: StackoverflowAnswer) => a.question_id === question_id)
        // sort them based on the score
        ?.sort((a, b) => b.score - a.score)
        // pick top 3
        ?.slice(0, 3);
        
        const answerBodiesFiltered = answerObjects?.map((a: StackoverflowAnswer) => a.body) || [];

        return {
            search_keywords: searchPhrase, // Replace with actual search keywords
            issue_link: `https://stackoverflow.com/questions/${question_id}`,
            issue_title: title,
            issue_body: questionBody,
            issue_score: score,
            issue_views: view_count,
            answer_1: answerBodiesFiltered[0] || null,
            answer_2: answerBodiesFiltered[1] || null,
            answer_3: answerBodiesFiltered[2] || null
        };
    });

    await csvWriterInstance.writeRecords(records);
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const collectData = async (outFile: string, startPage: number, endPage: number) => {
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    
    for (const phrase of searchPhrases) {
        for (const page of pages) {
            console.log(`Searching for ${phrase} on page ${page}`);
            const data = await fetchData(phrase, page.toString());
            const sanitizedData = sanitizeData(data);
            // console.log('Sanitized data:', sanitizedData);
            await saveData(outFile, phrase, sanitizedData)

            // wait for 2 seconds before making another request to avoid rate limiting
            await sleep(2 * 1000);
        }
    }
}