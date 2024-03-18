import axios from "axios";
import cheerio from "cheerio";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";

const keywords = [
    "note",
    "warning",
    "prohibited",
    "only once",
    "must",
    "imperative",
    "only",
    "not support",
    "permissible",
    "should",
];

interface KeywordMatch {
    keyword: string;
    matchingSentence: string;
    pageUrl: string;
}

// Adjusted helper function to also take mainBaseUrl and check if the resolved link is within the main site
const resolveLink = (base: string, relative: string): string | null => {
    if (relative.startsWith("http")) {
        return relative;
    } else {
        return new URL(relative, base).toString();
    }
};

const normalizeUrl = (url: string): string => {
    const normalizedUrl = new URL(url);

    // Normalize the scheme to lowercase
    normalizedUrl.protocol = normalizedUrl.protocol.toLowerCase();

    // Normalize the host to lowercase
    normalizedUrl.hostname = normalizedUrl.hostname.toLowerCase();

    // Remove default ports (http: 80, https: 443)
    if (normalizedUrl.port === "80" || normalizedUrl.port === "443") {
        normalizedUrl.port = "";
    }

    // Normalize the pathname to ensure a trailing slash for the root path
    normalizedUrl.pathname = normalizedUrl.pathname.replace(/\/?$/, "/");

    // Sort query parameters
    const params = new URLSearchParams(normalizedUrl.searchParams);
    const sortedParams = new URLSearchParams();
    Array.from(params.keys())
        .sort()
        .forEach((key) => {
            sortedParams.set(key, params.get(key)!);
        });
    normalizedUrl.search = sortedParams.toString();

    // Ignore fragment identifiers
    normalizedUrl.hash = "";

    normalizedUrl.pathname = normalizedUrl.pathname.replace(
        /\/index\.html\/?$/,
        "/"
    );

    return normalizedUrl.toString();
};

const isFileUrl = (url: string): boolean => {
    try {
        const parsedUrl = new URL(url);
        const path = parsedUrl.pathname;
        // Check if the URL's pathname has a period followed by one or more non-slash characters before its end
        // and exclude .html extensions
        const hasExtension = /\.\w+($|\?|#)/.test(path);
        const isHtml = path.endsWith('.html') || path.endsWith('.htm');
        return hasExtension && !isHtml;
    } catch (error) {
        console.error('Error parsing URL:', error);
        return false;
    }
};

const directToAnotherWebsite = (
    rootLink: string,
    resolvedLink: string
): boolean => {
    return !resolvedLink.startsWith(rootLink);
};

const visitMainAndNestedPages = async (
    mainLink: string,
    callback: (content: cheerio.Root, url: string) => Promise<void>
): Promise<string[]> => {
    let linksToVisit: Set<string> = new Set([mainLink]);
    let normalizedVisitedLinks: Set<string> = new Set();
    let visitedLinks: Set<string> = new Set();

    // Ensure mainLink ends with a slash for consistent comparison
    const mainBaseUrl = mainLink.endsWith("/") ? mainLink : `${mainLink}/`;

    while (linksToVisit.size > 0) {
        const currentLink: string = linksToVisit.values().next().value;
        linksToVisit.delete(currentLink);

        if (normalizedVisitedLinks.has(normalizeUrl(currentLink))) {
            continue; // Skip if we've already visited this link
        }

        console.log(`Visiting: ${currentLink}`);
        normalizedVisitedLinks.add(normalizeUrl(currentLink));
        visitedLinks.add(currentLink);

        try {
            const response = await axios.get(currentLink);
            const $ = cheerio.load(response.data);
            await callback($, currentLink);
            $("a").each((_, element) => {
                const href = $(element).attr("href");
                const targetLink = resolveLink(currentLink, href || "");

                if (
                    !targetLink ||
                    directToAnotherWebsite(mainBaseUrl, targetLink) ||
                    normalizedVisitedLinks.has(normalizeUrl(targetLink))
                ) {
                    return;
                }

                if (isFileUrl(targetLink)) {
                    console.warn('skipping file link:', targetLink)
                    return;
                }

                linksToVisit.add(targetLink);
            });
        } catch (error: any) {
            console.error(`Error visiting ${currentLink}: `, error.message);
        }
    }

    return Array.from(visitedLinks);
};

const readLinksFromFile = (linksFile: string): string[] => {
    const links: string[] = [];
    try {
        const fileContent = fs.readFileSync(linksFile, "utf-8");
        const lines = fileContent.split("\n");
        lines.forEach((line) => {
            const link = line.trim();
            if (link) {
                links.push(link);
            }
        });
    } catch (error) {
        console.error("Error reading links file:", error);
    }
    return links;
};

const saveToCsv = async (data: Array<KeywordMatch>, filePath: string): Promise<void> => {
    const fileExists = fs.existsSync(filePath);
    const base = path.dirname(filePath);

    if (!fs.existsSync(base)) {
        fs.mkdirSync(base);
    }

    const csvWriter = createObjectCsvWriter({
        path: filePath,
        header: [
            {id: 'keyword', title: 'KEYWORD'},
            {id: 'matchingSentence', title: 'MATCHING SENTENCE'},
            {id: 'pageUrl', title: 'PAGE URL'}
        ],
        append: fileExists,
    });

    await csvWriter.writeRecords(data);
}

export const scanDocs = async (linksFile: string, outDir: string) => {
    // Example usage
    const links = readLinksFromFile(linksFile);
    
    for (const link of links) {
        const allMatches: Array<KeywordMatch> = [];
        try {
            await visitMainAndNestedPages(
                link,
                async (content, url: string) => {
                    content("p, li, h1, h2, h3, h4, h5, h6").each((_, element) => {
                        const text = content(element).text();
                        // Split the text into sentences
                        const sentences = text.match(/[^.!?]+[.!?]/g) || [text];
                        // Check each sentence for each keyword
                        sentences.forEach((sentence) => {
                            keywords.forEach((keyword) => {
                                if (sentence.toLowerCase().includes(keyword)) {
                                    allMatches.push({
                                        keyword: keyword,
                                        matchingSentence: sentence.trim(),
                                        pageUrl: url,
                                    });
                                }
                            });
                        });
                    });
                }
            );

            // get domain name from link
            const domainName = new URL(link).hostname;
            const filePath = path.resolve(outDir, `${domainName}.csv`)
            saveToCsv(allMatches, filePath)
        } catch (error) {
            console.error("Error:", error);
        }
    }

};
