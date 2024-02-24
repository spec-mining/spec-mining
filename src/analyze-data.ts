import dotenv from "dotenv";
dotenv.config();

import fs from "fs";
import csv from "csv-parser";
import OpenAI from "openai";
import { createObjectCsvWriter } from "csv-writer";

import { CUSTOM_INSTRUCTIONS_PROMPT } from "./constants";

const MAX_RETRY_COUNT = 2;

const history: Array<OpenAI.Chat.Completions.ChatCompletionMessageParam> = [
  {
    role: "user",
    content: CUSTOM_INSTRUCTIONS_PROMPT,
  },
  {
    role: "assistant",
    content:
      "Sure, please provide the list of issues in JSON format, and I'll proceed with the analysis for each one.",
  },
];

const openai = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY_2"], // This is the default and can be omitted
  organization: "org-OzVBy55bI74K0Y2WSivPTmsG",
});

interface Issue {
  issue_link: string;
  issue_title: string;
  issue_body: string;
  answer_1: string;
  answer_2: string;
  answer_3: string;
  issue_score?: number;
  issue_views?: number;
}

interface GPTAnalysis {
  issue_link: string;
  ai_verdict: Boolean;
  reason: string;
  api_details: {
    library_name: string;
    api_name: string;
    issue_description: string;
    expected_vs_actual_behavior: string;
    trigger_conditions: string;
    reason_for_difficulty_in_detection: string;
  };
}

interface GPTOutput {
  analysis_results: Array<GPTAnalysis>;
}

interface AnalyzedIssue extends Issue, GPTAnalysis {
  human_classification: boolean;
  human_reason: string;
}

interface IssueChunk {
  content: string;
  index: number;
  numberOfIssues: number;
}

const readData = async (
  inputFile: string,
  startIndex: number,
  endIndex: number
): Promise<Array<Issue>> => {
  const dataRecords: Array<Issue> = [];

  return new Promise((resolve, reject) => {
    fs.createReadStream(inputFile)
      .pipe(csv())
      .on("data", (data) => {
        dataRecords.push({
          issue_link: data.issue_link,
          issue_title: data.issue_title,
          issue_body: data.issue_body,
          issue_score: data.issue_score,
          issue_views: data.issue_views,
          answer_1: data.answer_1,
          answer_2: data.answer_2,
          answer_3: data.answer_3,
        });
      })
      .on("end", () => {
        resolve(dataRecords.slice(startIndex, endIndex));
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

/**
 * Stringify each issue and add it to the string chunk until
 * the charachter size is less than or equal to chunkSize
 * @param issues
 * @param chunkSize
 * @returns
 */
const makeIssueChunks = (issues: Array<Issue>, chunkSize: number) => {
  const issueChunks: Array<IssueChunk> = [];
  let currentChunk: IssueChunk = {
    content: "[",
    index: 0,
    numberOfIssues: 0,
  };
  const skippedIssues = []

  for (let issue of issues) {
    // remove issue_score and issue_views from the issue object because gpt is not expecting them
    delete issue.issue_score;
    delete issue.issue_views;
    const stringifiedIssue = JSON.stringify(issue, null, 2);

    // make sure stringified issue is less than or equal 1/3 of chunkSize
    if (stringifiedIssue.length > chunkSize / 3) {
      skippedIssues.push(issue.issue_link);
      console.error(
        `Issue ${issue.issue_link} is too large to fit in a chunk. Skipping it.`
      );
      continue;
    }

    if (currentChunk.content.length + stringifiedIssue.length <= chunkSize) {
      currentChunk = {
        content: `${currentChunk.content}${stringifiedIssue},`,
        index: currentChunk.index,
        numberOfIssues: currentChunk.numberOfIssues + 1,
      };
    } else {
      issueChunks.push({
        ...currentChunk,
        content: `${currentChunk.content.substring(
          0,
          currentChunk.content.length - 1
        )}]`,
      });
      currentChunk = {
        content: stringifiedIssue,
        index: currentChunk.index + 1,
        numberOfIssues: 1,
      };
    }
  }

  issueChunks.push(currentChunk);

  return {issueChunks, skippedIssues};
};

const analyzeIssueChunk = async (
  issueChunk: IssueChunk
): Promise<string | null> => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [...history, { role: "user", content: issueChunk.content }],
    model: "gpt-3.5-turbo-16k-0613",
    temperature: 0.4,
  });

  return chatCompletion.choices[0].message.content;
};

type CsvHeader<T> = Array<{ id: keyof T; title: string }>;

/**
 * Saves an array of analyzedIssue objects to a CSV file.
 * @param {Array} analyzedIssues Array of issue objects to be saved.
 * @param {String} outputPath The path where the CSV file will be saved.
 */
async function saveIssuesToCSV(
  analyzedIssues: Array<AnalyzedIssue>,
  outputPath: string
) {
  // check if the file exists
  const fileExists = fs.existsSync(outputPath);

  const csvWriter = createObjectCsvWriter({
    path: outputPath,
    header: [
      { id: "issue_link", title: "ISSUE_LINK" },
      { id: "ai_verdict", title: "AI_VERDICT" },
      { id: "reason", title: "REASON" },
      { id: "api_details.library_name", title: "LIBRARY_NAME" },
      { id: "api_details.api_name", title: "API_NAME" },
      { id: "api_details.issue_description", title: "ISSUE_DESCRIPTION" },
      {
        id: "api_details.normal_conditions",
        title: "NORMAL_CONDITIONS",
      },
      { id: "api_details.trigger_conditions", title: "TRIGGER_CONDITIONS" },
      {
        id: "api_details.reason_for_difficulty_in_detection",
        title: "REASON_FOR_DIFFICULTY_IN_DETECTION",
      },
      { id: "issue_title", title: "ISSUE_TITLE" },
      { id: "issue_body", title: "ISSUE_BODY" },
      { id: "answer_1", title: "ANSWER_1" },
      { id: "answer_2", title: "ANSWER_2" },
      { id: "answer_3", title: "ANSWER_3" },
      { id: "human_classification", title: "HUMAN_CLASSIFICATION" },
      { id: "human_reason", title: "HUMAN_REASON" },
      { id: 'issue_score', title: 'ISSUE_SCORE' },
      { id: 'issue_views', title: 'ISSUE_VIEWS' }
    ] as CsvHeader<AnalyzedIssue>,
    headerIdDelimiter: ".",
    append: fileExists, // Set to true if you want to append to an existing file
  });

  try {
    await csvWriter.writeRecords(analyzedIssues);
    console.log("Data has been written to CSV file successfully.");
  } catch (error) {
    console.error("Error writing to CSV file:", error);
  }
}

const makeRetriableOnFailure = (fn: Function, retryCount: number) => {
  let retries = 0;
  const wrappedFunction = async (...args: any[]) => {
    while (retries < retryCount) {
      try {
        return await fn(...args);
      } catch (error) {
        console.error(`Error on attempt ${retries + 1}:`, error);
        retries++;
      }
    }

    return null;
  };

  return wrappedFunction;
};

const parseGptJsonResponse = (jsonLikeAnalysis: string) => {
    const jsonRegex = /```json(.*?)```/s;
    const jsonMatch = jsonRegex.exec(jsonLikeAnalysis);
    if (jsonMatch) {
        console.log('found code block in response, parsing it')
      return JSON.parse(jsonMatch[1]);
    } else {
        console.log('no code block found in response, parsing it as is')
        return JSON.parse(jsonLikeAnalysis);
    }
}

export const analyzeData = async (
  inputPath: string,
  outputPath: string,
  startIndex: number,
  endIndex: number
) => {
  const issuesToAnalyze = await readData(inputPath, startIndex, endIndex);
  const {issueChunks, skippedIssues} = makeIssueChunks(issuesToAnalyze, 20_000);
  let analyzedSoFar = 0;

  for (let chunk of issueChunks) {
    const currentChunkFirstIndex = analyzedSoFar;
    const currentChunkLastIndex = analyzedSoFar + chunk.numberOfIssues - 1;
    console.log(
      `Processing issues ${currentChunkFirstIndex}-${currentChunkLastIndex} of ${issuesToAnalyze.length} (indices ${startIndex + currentChunkFirstIndex}-${startIndex + currentChunkLastIndex})`
    );
    console.log(`Chunk ${chunk.index + 1} of ${issueChunks.length}`);
    analyzedSoFar += chunk.numberOfIssues;

    const parsedAnalysis: GPTOutput = await makeRetriableOnFailure(async () => {
      console.log(
        "Posting to OpenAI chunk:",
        chunk.index + 1,
        "of",
        issueChunks.length,
        "with",
        chunk.numberOfIssues,
        "issues"
      );
      const jsonLikeAnalysis = await analyzeIssueChunk(chunk);

      if (!jsonLikeAnalysis) {
        console.error(
          `Error analyzing issues ${currentChunkFirstIndex}-${currentChunkLastIndex}`
        );
        return null;
      }

      try {
        return parseGptJsonResponse(jsonLikeAnalysis);
      } catch (error) {
        console.log(`Failing JSON\n`, jsonLikeAnalysis);
        console.error(
          `Error parsing JSON of issues ${currentChunkFirstIndex}-${currentChunkLastIndex}`
        );
        throw error;
      }
    }, MAX_RETRY_COUNT)();

    if (parsedAnalysis) {
      const analyzedIssuesFromChunk: Array<AnalyzedIssue> =
        parsedAnalysis.analysis_results?.map((analyzedIssue) => {
          const correspondingIssue = issuesToAnalyze.find(
            (originalIssue) =>
              originalIssue.issue_link === analyzedIssue.issue_link
          );

          return {
            ...(correspondingIssue || {
              issue_link: "",
              issue_title: "",
              issue_body: "",
              answer_1: "",
              answer_2: "",
              answer_3: "",
            }),
            ...analyzedIssue,
            human_classification: false,
            human_reason: "",
          };
        });
      await saveIssuesToCSV(analyzedIssuesFromChunk, outputPath);
    }
  }

  console.log('Done analyzing all chunks')
  console.log(`Skipped ${skippedIssues.length} issues:\n`, JSON.stringify(skippedIssues, null, 2));
};
