import fs from 'fs';
import csv from 'csv-parser';
import { createObjectCsvWriter } from 'csv-writer';
import { Octokit } from '@octokit/core';
import { WithRateLimitMetaData, sleepTillRateLimitResets } from './collect-github-libs';
import path from 'path';

const GH_ACCESS_TOKEN = process.env['GH_ACCESS_TOKEN'];
const octokit = new Octokit({ auth: GH_ACCESS_TOKEN });

interface GithubIssue {
    title: string,
    body: string,
    url: string,
}

interface DependantRepoRecord {
    Owner: string
    "Repository Name": string
    "Dependency Name": string
}

export const collectGithubIssues = async (reposFile: string, outFolder: string) => {
    // Ensure the output directory exists
    if (!fs.existsSync(outFolder)) {
        fs.mkdirSync(outFolder, { recursive: true });
    }

    // Read the CSV file to get the list of repositories and their dependencies
    const repos: Array<DependantRepoRecord> = await new Promise((resolve, reject) => {
        const readRepos: Array<DependantRepoRecord> = [];
        fs.createReadStream(reposFile)
            .pipe(csv())
            .on('data', (data) => readRepos.push(data))
            .on('end', async () => resolve(readRepos))
            .on('error', (err) => reject(err))
    })

    for (const { Owner: owner, "Repository Name": repoName, "Dependency Name": dependencyName } of repos) {
        console.log('Fetching issues of', dependencyName, 'from', owner, '/', repoName, 'on GitHub')
        const issues = await fetchIssues(owner, repoName, dependencyName);

        if (issues.data.length > 0) {
            await writeIssuesToCsv(issues.data, `${owner}-${repoName}`, `${outFolder}/${dependencyName}-issues.csv`);
        }

        sleepTillRateLimitResets(issues.remainingRateLimit, issues.rateLimitReset)
    }
};

const fetchIssues = async (owner: string, repo: string, dependencyName: string): Promise<WithRateLimitMetaData<Array<GithubIssue>>> => {
    let thereIsMore = true;
    const foundIssues: Array<GithubIssue> = [];
    let rateLimitReset;
    let remainingRateLimit;

    while (thereIsMore) {
        const query = `repo:${owner}/${repo} ${dependencyName} in:title,body is:closed`;
        const response = await octokit.request('GET /search/issues', {
            q: query,
            per_page: 100, // Adjust based on your needs
        });
    
        thereIsMore = response.data.incomplete_results
        rateLimitReset = response.headers["x-ratelimit-reset"]
        remainingRateLimit = response.headers["x-ratelimit-remaining"]
    

        foundIssues.push(...response.data.items.map(issue => ({
           title: issue.title,
           body: issue.body || '',
           url: issue.html_url,
        })))
        console.log('Found', foundIssues.length, 'issues.', thereIsMore ? 'Fetching more...' : 'All fetched!')

        sleepTillRateLimitResets(remainingRateLimit, rateLimitReset)
    }

    return {
        data: foundIssues,
        rateLimitReset,
        remainingRateLimit,
    };
}

const writeIssuesToCsv = async (issues: GithubIssue[], dependantFullName: string, filePath: string) => {
    const fileExists = fs.existsSync(filePath);
    const base = path.dirname(filePath);

    if (!fs.existsSync(base)) {
        fs.mkdirSync(base);
    }

    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
            {id: 'dependantFullName', title: 'Dependant Full Name'},
            {id: 'title', title: 'TITLE'},
            {id: 'body', title: 'BODY'},
            {id: 'url', title: 'URL'},
        ],
        append: fileExists,
    });

    await csvWriter.writeRecords(issues.map((issue) => ({...issue, dependantFullName})));
}

// Note: Replace 'your_github_token' with your actual GitHub Personal Access Token.
