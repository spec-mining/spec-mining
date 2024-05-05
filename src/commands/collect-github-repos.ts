import dotenv from "dotenv";
dotenv.config();

import { Octokit } from '@octokit/core';
import fs from 'fs-extra'
import path from "path";
import { createObjectCsvWriter } from "csv-writer";
import { sleep } from "openai/core";
import { removeRepetition } from "./remove-repetition";
import { sortList } from "../utils/sortList";
import { specIDList } from "../constants";

const GH_ACCESS_TOKEN = process.env['GH_ACCESS_TOKEN'];
const octokit = new Octokit({ auth: GH_ACCESS_TOKEN });
const MANIFEST_FILES = [
    "setup.py",
    "requirements.txt",
    "Pipfile",
    "Pipfile.lock",
    "pyproject.toml",
    "environment.yml",
    "tox.ini"
]

export interface BaseRepository {
    owner: string,
    repoName: string
}

export interface DependantRepoDetails extends BaseRepository {
    repoLink: string,
    stars: number,
    forks: number,
    issues: number,
    pullRequests: number,
    description: string,
    fileName?: string,
    dependencyName: string,
    testingFramework: string,
    created_at: string
    specName?: string
}

export type WithRateLimitMetaData<T> = {
    data: T,
    rateLimitReset?: string,
    remainingRateLimit?: string
}

const formatTimestamp = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day}-${hours}-${minutes}-${seconds}`;
}

export const sleepTillRateLimitResets = async (remainingRateLimit?: string, rateLimitReset?: string) => {
    console.log('Rate limit reset:', rateLimitReset, 'Remaining rate limit:', remainingRateLimit);

    if (remainingRateLimit !== undefined && rateLimitReset !== undefined && Number.parseInt(remainingRateLimit) < 2) {
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds since epoch
        const delaySeconds = Number.parseInt(rateLimitReset) - currentTime + 10; // Time to wait until reset (10 seconds added to be safe)

        console.log('Rate limit reached, will wait for ', delaySeconds, ' seconds');
        await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000));
        console.log('Resuming after rate limit reset');
    }
}

const searchForFiles = async (fileNames: Array<string>, libName: string, testingFramework: string, page: number): Promise<WithRateLimitMetaData<Array<BaseRepository & { fileName: string }>>> => {
    const filePathList = fileNames.map(fileName => `filename:${fileName}`).join("+OR+");
    const searchQuery = `${libName}+${testingFramework}+in:file+${filePathList}`;
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

const searchForRegex = async (specRegex: string, page: number): Promise<WithRateLimitMetaData<Array<BaseRepository & { fileName: string }>>> => {
    const searchQuery = `${specRegex}+language:Python`;

    console.log('Running query:', searchQuery);
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

    // fs.outputFileSync('repoQueries.txt', repoQueries)
  
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
            { id: 'fileName', title: 'File Name' },
            { id: 'dependencyName', title: 'Dependency Name' },
            { id: 'specName', title: 'Spec Name' },
            { id: 'testingFramework', title: 'Testing Framework' },
            { id: 'created_at', title: 'Created At' }
        ],
        append: fileExists
    });

    // escape commas to avoid issues
    await csvWriterInstance.writeRecords(data.map((record) => ({
        description: record.description?.replace(/,/g, ' ')?.replace(/;/g, ' ') || '',
        dependencyName: record.dependencyName || '',
        owner: record.owner || 'N/A',
        repoName: record.repoName || 'N/A',
        repoLink: record.repoLink || 'N/A',
        stars: record.stars || 0,
        forks: record.forks || 0,
        created_at: new Date(record.created_at).toLocaleDateString(),
        fileName: record.fileName || '',
        issues: record.issues || 0,
        pullRequests: record.pullRequests || 0,
        testingFramework: record.testingFramework,
        specName: record.specName || ''
    })));
}

/**
 * Collect information about python libraries that depend on a given library from GitHub
 */
export const collectGithubRepos = async (outDir: string, libNames: Array<string>, testFrameworks: Array<string>, startPage: number, endPage: number) => {
    if (endPage > 10) {
        console.warn('End page is greater than 10, which is the maximum number of pages allowed by GitHub code search API. Setting end page to 10');
        endPage = 10;
    }

    const timestamp = Date.now().toString()
    const libNamesStr = libNames.join('_');
    const filePath = path.resolve(outDir, `${libNamesStr}_dependant_repos_${timestamp}.csv`)

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    for (const libName of libNames) {
        for (const file of MANIFEST_FILES) { // this is done to overcome github's limit of 1000 results per search
            for (const testFramework of testFrameworks) {
                for (const page of pages) {
                    console.log('File: ', file, 'Page:', page, ' - Fetching details for', libName, 'from GitHub', 'with test framework:', testFramework);
                    const {data: baseRepoInfo, rateLimitReset, remainingRateLimit} = await searchForFiles([file], libName, testFramework, page)
    
                    const chunks = [baseRepoInfo.slice(0, baseRepoInfo.length/2), baseRepoInfo.slice(baseRepoInfo.length/2, baseRepoInfo.length)]
            
                    await Promise.all(chunks.map(async (chunk, i) => {
                        if (chunk.length < 1) return;
    
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
                                fileName: chunk[index].fileName,
                                dependencyName: libName,
                                testingFramework: testFramework,
                                created_at: repoDetails.createdAt
                            }
                        });
                    
                        console.log('File: ', file, 'Page:', page, ' - ',i + 1, '. Fetched details for', repoDetails.length, 'repos.');
        
                        await saveData(filePath, repoDetails);
                    }))
        
                    removeRepetition(filePath, 'Repository Link', ['Dependency Name', 'Testing Framework'])
                    sortList(filePath, {
                        sortField: 'Stars',
                        customFunction: (a, b) => {
                            // make an array of strings from dep1;dep2;dep3
                            const aStars = Number.parseInt(a['Stars']);
                            const bStars = Number.parseInt(b['Stars']);
                            const aDependencyCount = (a['Dependency Name']?.split('|')?.length || 1) * 10;
                            const bDependencyCount = (b['Dependency Name']?.split('|')?.length || 1) * 10;
                            let result = bDependencyCount * bStars - aDependencyCount * aStars;
    
                            if (result === 0) {
                                result = bStars - aStars;
                            }
                            
                            return result;
                        }
                    })
            
                    await sleepTillRateLimitResets(remainingRateLimit, rateLimitReset);
                }
            }
        }
    }
}

const usesPytest = async (reposInfo: Array<BaseRepository>) => {
    const filePathList = MANIFEST_FILES.map(fileName => `filename:${fileName}`).join("+OR+");
    const targetPackages = reposInfo.map(repo => `repo:${repo.owner}/${repo.repoName}`).join("+OR+");
    const searchQuery = `${targetPackages}+pytest+in:file+${filePathList}`;
    const searchResults = await octokit.request('GET /search/code', {
        q: searchQuery,
        per_page: 100, // Adjust per_page as needed, up to a maximum of 100
    });

    const rateLimitReset = searchResults.headers["x-ratelimit-reset"]
    const remainingRateLimit = searchResults.headers["x-ratelimit-remaining"]

    const doesUse = searchResults.data.items.map(item => ({
        owner: item.repository.owner.login,
        repoName: item.repository.name
    }));

    return {
        data: reposInfo.map((repo) => {
            return {
                ...repo,
                usesTestingFramework: doesUse.find((item) => item.owner === repo.owner && item.repoName === repo.repoName) !== undefined
            }
        }),
        rateLimitReset,
        remainingRateLimit
    }
}

export const collectGithubReposUsingSpecs = async (outDir: string, testFrameworks: Array<string>, startPage: number, endPage: number) => {
    if (endPage > 10) {
        console.warn('End page is greater than 10, which is the maximum number of pages allowed by GitHub code search API. Setting end page to 10');
        endPage = 10;
    }

    const filePath = path.resolve(outDir, `repos_using_specs_${formatTimestamp()}.csv`)

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    for (const specId of specIDList) {
        for (const testFramework of testFrameworks) {
            for (const page of pages) {
                console.log('Page:', page, ' - Finding repos for spec [', specId.specName, '] from GitHub', 'with test framework:', testFramework);
                const {data: baseRepoInfo, rateLimitReset, remainingRateLimit} = await searchForRegex(specId.githubQuery, page)
                console.log('Found', baseRepoInfo.length, 'results previous query from GitHub');

                await sleepTillRateLimitResets(remainingRateLimit, rateLimitReset);

                // filter out repetitions
                const uniqueBaseRepoInfo = baseRepoInfo.filter((repo, index, self) =>
                    index === self.findIndex((t) => (
                        t.owner === repo.owner && t.repoName === repo.repoName
                    ))
                );
                console.log('Unique repos:', uniqueBaseRepoInfo.length);

                // devide uniqueBaseRepoInfo into n chunks
                const n = 5;
                const chunks = Array.from({ length: n }, (_, i) => uniqueBaseRepoInfo.slice(i * uniqueBaseRepoInfo.length/n, (i + 1) * uniqueBaseRepoInfo.length/n));

                let rateLimitReset2 = rateLimitReset;
                let remainingRateLimit2 = remainingRateLimit;
                let i = 0;
                for (const chunk of chunks) {
                    if (chunk.length < 1) return;

                    const { data, rateLimitReset, remainingRateLimit } = await usesPytest(chunk);
                    console.log('Chunk:', i + 1, ' - Found', data.filter(repo => repo.usesTestingFramework).length, 'repos out of ', data.length, 'repos that use pytest.');
                    rateLimitReset2 = rateLimitReset;
                    remainingRateLimit2 = remainingRateLimit;
                    const filteredBaseRepoInfo = data.filter(repo => repo.usesTestingFramework);
                    await sleepTillRateLimitResets(remainingRateLimit2, rateLimitReset2);

                    const response = await fetchRepositoriesDetails(filteredBaseRepoInfo);
                
                    const repoDetails: Array<DependantRepoDetails> = filteredBaseRepoInfo.map((repo, index) => {
                        const details = response[`repo${index}`].repository;
                        return {
                            ...repo,
                            repoLink: details.url,
                            stars: details.stargazers.totalCount,
                            forks: details.forks.totalCount,
                            issues: details.issues.totalCount,
                            pullRequests: details.pullRequests.totalCount,
                            description: details.description,
                            fileName: chunk[index].fileName,
                            dependencyName: specId.dependencyName,
                            testingFramework: testFramework,
                            created_at: details.createdAt,
                            specName: specId.specName,
                        }
                    });

                    await saveData(filePath, repoDetails);
                }
                await sleepTillRateLimitResets(remainingRateLimit2, rateLimitReset2);

                removeRepetition(filePath, 'Repository Link', ['Spec Name', 'Dependency Name'])
                sortList(filePath, {
                    sortField: 'Stars',
                    customFunction: (a, b) => {
                        // make an array of strings from dep1;dep2;dep3
                        const aStars = Number.parseInt(a['Stars']);
                        const bStars = Number.parseInt(b['Stars']);
                        const aDependencyCount = (a['Spec Name']?.split('|')?.length || 1) * 10;
                        const bDependencyCount = (b['Spec Name']?.split('|')?.length || 1) * 10;
                        let result = bDependencyCount * bStars - aDependencyCount * aStars;

                        if (result === 0) {
                            result = bStars - aStars;
                        }
                        
                        return result;
                    }
                })
            }
        }
    }
}