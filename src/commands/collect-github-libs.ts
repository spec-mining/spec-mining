import dotenv from "dotenv";
dotenv.config();

import { Octokit } from '@octokit/core';
import fs from 'fs-extra'
import path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { sleep } from "openai/core";
import { removeRepetition } from "./remove-repetition";

const GH_ACCESS_TOKEN = process.env['GH_ACCESS_TOKEN'];
const octokit = new Octokit({ auth: GH_ACCESS_TOKEN });
const MANIFEST_FILES = [
    "setup.py",
    "requirements.txt",
    "Pipfile",
    "Pipfile.lock",
    "pyproject.toml",
    "environment.yml"
]

interface BaseRepository {
    owner: string,
    repoName: string
}

interface DependantRepoDetails extends BaseRepository {
    repoLink: string,
    stars: number,
    forks: number,
    issues: number,
    pullRequests: number,
    description: string,
    manifestFileName: string,
    dependencyName: string,
    created_at: string
}

type WithRateLimitMetaData<T> = {
    data: T,
    rateLimitReset?: string,
    remainingRateLimit?: string

}

const searchForFiles = async (fileNames: Array<string>, dependencyName: string, page: number): Promise<WithRateLimitMetaData<Array<BaseRepository & { fileName: string }>>> => {
    const filePathList = fileNames.map(fileName => `filename:${fileName}`).join("+OR+");
    const searchQuery = `${dependencyName}+in:file+${filePathList}`;
    const searchResults = await octokit.request('GET /search/code', {
        q: searchQuery,
        per_page: 100, // Adjust per_page as needed, up to a maximum of 100
        page,
    });

    const rateLimitReset = searchResults.headers["x-ratelimit-reset"]
    const remainingRateLimit = searchResults.headers["x-ratelimit-remaining"]

    return {
        data: searchResults.data.items.map(item => ({
            owner: item.repository.owner.login,
            repoName: item.repository.name,
            fileName: item.name
        })),
        rateLimitReset,
        remainingRateLimit
    };

}

const constructRepoDetailsQuery = (repositories: Array<BaseRepository>) => {
    const repoQueries = repositories.map((repo, index) => `
      repo${index}: repositoryOwner(login: "${repo.owner}") {
        repository(name: "${repo.repoName}") {
          description
          forks {
            totalCount
          }
          issues {
            totalCount
          }
          stargazers {
            totalCount
          }
          pullRequests {
            totalCount
          }
          url
          createdAt
        }
      }
    `).join('\n');

    fs.outputFileSync('repoQueries.txt', repoQueries)
  
    // Return the complete query
    return `
      query {
        ${repoQueries}
      }
    `;
}

type ResponseType = {
    [key: string]: {
        repository: {
            description: string,
            forks: {
                totalCount: number
            },
            issues: {
                totalCount: number
            },
            stargazers: {
                totalCount: number
            },
            pullRequests: {
                totalCount: number
            },
            url: string,
            createdAt: string
        }
    }
}
 
const fetchRepositoriesDetails =  async (repositories: Array<BaseRepository>): Promise<ResponseType> => {
    try {
        return await octokit.graphql(constructRepoDetailsQuery(repositories));
    } catch (error) {
        console.error("Error fetching repository details:", error);
        return {};
    }
}

const saveData = async (outFile: string, data: Array<DependantRepoDetails>) => {
    const fileExists = fs.existsSync(outFile);
    const base = path.dirname(outFile);

    if (!fs.existsSync(base)) {
        fs.mkdirSync(base);
    }

    const csvWriterInstance = createObjectCsvWriter({
        path: outFile,
        header: [
            { id: 'owner', title: 'Owner' },
            { id: 'repoName', title: 'Repository Name' },
            { id: 'repoLink', title: 'Repository Link' },
            { id: 'stars', title: 'Stars' },
            { id: 'forks', title: 'Forks' },
            { id: 'issues', title: 'Issues' },
            { id: 'pullRequests', title: 'Pull Requests' },
            { id: 'description', title: 'Description' },
            { id: 'manifestFileName', title: 'Manifest File Name' },
            { id: 'dependencyName', title: 'Dependency Name' },
            { id: 'created_at', title: 'Created At' }
        ],
        append: fileExists
    });

    await csvWriterInstance.writeRecords(data);
}

/**
 * Collect information about python libraries that depend on a given library from GitHub
 */
export const collectGithubLibs = async (outDir: string, dependencyName: string, startPage: number, endPage: number) => {
    if (endPage > 10) {
        console.warn('End page is greater than 10, which is the maximum number of pages allowed by GitHub code search API. Setting end page to 10');
        endPage = 10;
    }

    const filePath = path.resolve(outDir, `${dependencyName}_dependant_repos.csv`)
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    for (const file of MANIFEST_FILES) { // this is done to overcome github's limit of 1000 results per search
        for (const page of pages) {
            console.log('File: ', file, 'Page:', page, ' - Fetching details for', dependencyName, 'from GitHub');
            const {data: baseRepoInfo, rateLimitReset, remainingRateLimit} = await searchForFiles([file], dependencyName, page)
    
            const chunks = [baseRepoInfo.slice(0, 50), baseRepoInfo.slice(50, 100)]
    
            await Promise.all(chunks.map(async (chunk, i) => {
                const response = await fetchRepositoriesDetails(chunk);
            
                const repoDetails: Array<DependantRepoDetails> = chunk.map((repo, index) => {
                    const repoDetails = response[`repo${index}`].repository;
                    return {
                        ...repo,
                        repoLink: repoDetails.url,
                        stars: repoDetails.stargazers.totalCount,
                        forks: repoDetails.forks.totalCount,
                        issues: repoDetails.issues.totalCount,
                        pullRequests: repoDetails.pullRequests.totalCount,
                        description: repoDetails.description,
                        manifestFileName: chunk[index].fileName,
                        dependencyName,
                        created_at: repoDetails.createdAt
                    }
                });
            
                console.log('File: ', file, 'Page:', page, ' - ',i + 1, '. Fetched details for', repoDetails.length, 'repos.');

                await saveData(filePath, repoDetails);
            }))

            removeRepetition(filePath, 'Repository Link')
            console.log('Rate limit reset:', rateLimitReset, 'Remaining rate limit:', remainingRateLimit);
    
            if (remainingRateLimit !== undefined && rateLimitReset !== undefined && Number.parseInt(remainingRateLimit) < 2) {
                const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds since epoch
                const delaySeconds = Number.parseInt(rateLimitReset) - currentTime + 10; // Time to wait until reset (10 seconds added to be safe)
    
                console.log('Rate limit reached, will wait for ', delaySeconds, ' seconds');
                await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
                console.log('Resuming after rate limit reset');
            }
        }
    }
}