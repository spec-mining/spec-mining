import axios from "axios";
import cheerio from "cheerio";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";

const regexPatterns = [
    // 1. "X before Y"
    /\b([\w]+\(.*?\)).*?\bbefore.*?\b([\w]+\(.*?\))/i,

    // 2. "X after Y"
    /\b([\w]+\(.*?\)).*?\bafter.*?\b([\w]+\(.*?\))/i,

    // 3. "Call/Invoke/Execute/Run/Perform X before Y"
    /\b(?:call|calls|called|calling|invoke|invokes|invoked|invoking|execute|executes|executed|executing|run|runs|ran|running|perform|performs|performed|performing).*?\b([\w]+\(.*?\)).*?\bbefore.*?\b([\w]+\(.*?\))/i,

    // 4. "Call/Invoke/Execute/Run/Perform X after Y"
    /\b(?:call|calls|called|calling|invoke|invokes|invoked|invoking|execute|executes|executed|executing|run|runs|ran|running|perform|performs|performed|performing).*?\b([\w]+\(.*?\)).*?\bafter.*?\b([\w]+\(.*?\))/i,

    // 5. "X depends on Y"
    /\b([\w]+\(.*?\)).*?\bdepends on.*?\b([\w]+\(.*?\))/i,

    // 6. "Cannot call/invoke/execute/run/perform X until Y has been called/invoked"
    /\bcannot.*?\b(?:call|calls|called|calling|invoke|invokes|invoked|invoking|execute|executes|executed|executing|run|runs|ran|running|perform|performs|performed|performing).*?\b([\w]+\(.*?\)).*?\buntil.*?\b([\w]+\(.*?\)).*?\bhas.*?\b(?:been\s+)?(?:called|calls|called|calling|invoked|invokes|invoked|invoking|executed|executes|executed|executing|run|runs|ran|running|performed|performs|performed|performing)/i,

    // 7. "Must call/invoke/execute/run/perform X before Y"
    /\bmust.*?\b(?:call|calls|called|calling|invoke|invokes|invoked|invoking|execute|executes|executed|executing|run|runs|ran|running|perform|performs|performed|performing).*?\b([\w]+\(.*?\)).*?\b(?:prior to|before).*?\b([\w]+\(.*?\))/i,

    // 8. "Should call/invoke/execute/run/perform X after Y"
    /\bshould.*?\b(?:call|calls|called|calling|invoke|invokes|invoked|invoking|execute|executes|executed|executing|run|runs|ran|running|perform|performs|performed|performing).*?\b([\w]+\(.*?\)).*?\bafter.*?\b([\w]+\(.*?\))/i,

    // 9. "First X, followed by Y"
    /\b(?:first|initially).*?\b([\w]+\(.*?\)).*?\b(?:followed by|then|and then).*?\b([\w]+\(.*?\))/i,

    // 10. "Once X is called/invoked, proceed with Y"
    /\bonce.*?\b([\w]+\(.*?\)).*?\b(?:is|has been).*?\b(?:called|calls|called|calling|invoked|invokes|invoked|invoking|executed|executes|executed|executing|run|runs|ran|running|performed|performs|performed|performing).*?\b.*?\b(?:proceed with|continue to).*?\b(?:call|calls|called|calling|invoke|invokes|invoked|invoking|execute|executes|executed|executing|run|runs|ran|running|perform|performs|performed|performing).*?\b([\w]+\(.*?\))/i,

    // 11. "X should always precede Y"
    /\b([\w]+\(.*?\)).*?\bshould.*?\balways.*?\b(?:precede|come before).*?\b([\w]+\(.*?\))/i,

    // 12. "X cannot be called until Y"
    /\b([\w]+\(.*?\)).*?\bcannot.*?\b(?:be\s+)?(?:called|calls|called|calling|invoked|invokes|invoked|invoking|executed|executes|executed|executing|run|runs|ran|running|performed|performs|performed|performing).*?\buntil.*?\b([\w]+\(.*?\))/i,

    // 13. "Failure to call/invoke/execute/run/perform X before Y will cause"
    /\bfailure to.*?\b(?:call|calls|called|calling|invoke|invokes|invoked|invoking|execute|executes|executed|executing|run|runs|ran|running|perform|performs|performed|performing).*?\b([\w]+\(.*?\)).*?\bbefore.*?\b([\w]+\(.*?\)).*?\bwill.*?\b(?:cause|result in)/i,

    // 14. "X is required before Y"
    /\b([\w]+\(.*?\)).*?\bis.*?\brequired.*?\b(?:before|prior to).*?\b([\w]+\(.*?\))/i,

    // 15. "Ensure/Make sure to call/invoke/execute/run/perform X before Y"
    /\b(?:ensure|make sure).*?\b(?:to\s+)?(?:call|calls|called|calling|invoke|invokes|invoked|invoking|execute|executes|executed|executing|run|runs|ran|running|perform|performs|performed|performing).*?\b([\w]+\(.*?\)).*?\b(?:before|prior to).*?\b([\w]+\(.*?\))/i,

    // 16. "Do/Perform X before Y"
    /\b(?:do|does|did|doing|perform|performs|performed|performing).*?\b([\w]+\(.*?\)).*?\b(?:before|prior to).*?\b([\w]+\(.*?\))/i,

    // 17. "You need to perform X first, followed by Y"
    /\byou.*?\bneed.*?\bto.*?\b(?:do|does|did|doing|perform|performs|performed|performing|call|calls|called|calling|invoke|invokes|invoked|invoking|execute|executes|executed|executing|run|runs|ran|running).*?\b([\w]+\(.*?\)).*?\bfirst.*?\b(?:followed by|then).*?\b([\w]+\(.*?\))/i,

    // 18. "X must be called prior to invoking Y"
    /\b([\w]+\(.*?\)).*?\bmust.*?\b(?:be\s+)?(?:called|calls|called|calling|invoked|invokes|invoked|invoking|executed|executes|executed|executing|run|runs|ran|running|performed|performs|performed|performing).*?\bprior to.*?\b(?:calling|calls|called|calling|invoking|invokes|invoked|invoking|executing|executes|executed|executing|running|runs|ran|running|performing|performs|performed|performing).*?\b([\w]+\(.*?\))/i,


  // 19. Before Calling
  /\bbefore\s+(?:call(?:ing|ed|s)?|invoke(?:ing|d|s)?|execute(?:ing|d|s)?|run(?:ning|s)?|perform(?:ing|ed|s)?|use(?:ing|d|s)?|start(?:ing|ed|s)?|initialize(?:ing|d|s)?|load(?:ing|ed|s)?|open(?:ing|ed|s)?|connect(?:ing|ed|s)?)\s+([\w]+\(\))\s*,?\s*(?:must|need(?:\s+to)?|have\s+to|should|ought\s+to|has\s+to|had\s+to)\s*(?:first\s+)?(?:call|invoke|execute|run|perform|use|start|initialize|load|open|connect)\s+([\w]+\(\))/i,

  // 20. After Completing
  /\bafter (?:completing|invoking|calling)\s+([\w]+\(\))\s*(?:method)?\s*,?\s*(?:the next step is to|you should proceed to|be sure to|you can then|proceed to|,)?\s*(?:call|invoke)\s+([\w]+\(\))/i,

  // 21. Should Be Called Prior To
  /(?:\bthe\s+)?([\w]+\(\))\s*(?:method)?\s*(?:should|must|needs to)?\s*be\s*(?:called|invoked)\s*(?:prior to|before)\s*(?:invoking|calling)\s+([\w]+\(\))/i,
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
                        sentences.forEach((sentence: string) => {
                            regexPatterns.forEach((pattern) => {
                                if (sentence.toLowerCase().match(pattern)) {
                                    allMatches.push({
                                        keyword: pattern.source,
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
