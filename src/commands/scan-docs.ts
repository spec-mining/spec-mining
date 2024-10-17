import axios from "axios";
import cheerio from "cheerio";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import path from "path";
import { split, TxtParentNodeWithSentenceNodeContent } from "sentence-splitter";

const regexPatterns = [
    // 1. "X before Y"
    /(.+?)\s+(?:before|prior to|preceding|earlier than|ahead of|in advance of)\s+(.+?)/i,

    // 2. "X after Y"
    /(.+?)\s+(?:after|subsequent to|later than|afterward)\s+(.+?)/i,

    // 3. "Call/Invoke/Execute/Run/Perform X before Y"
    /(?:\bcall(?:s|ed|ing)?\b|\binvoke(?:s|d|ing)?\b|\bexecute(?:s|d|ing)?\b|\brun(?:s|ning)?\b|\bperform(?:s|ed|ing)?\b|\buse(?:s|d|ing)?\b|\bstart(?:s|ed|ing)?\b|\binitialize(?:s|d|ing)?\b|\bload(?:s|ed|ing)?\b|\bopen(?:s|ed|ing)?\b|\bconnect(?:s|ed|ing)?\b)\s+(.+?)\s+(?:before|prior to|preceding|earlier than|ahead of|in advance of)\s+(.+?)/i,

    // 4. "Call/Invoke/Execute/Run/Perform X after Y"
    /(?:\bcall(?:s|ed|ing)?\b|\binvoke(?:s|d|ing)?\b|\bexecute(?:s|d|ing)?\b|\brun(?:s|ning)?\b|\bperform(?:s|ed|ing)?\b|\buse(?:s|d|ing)?\b|\bstart(?:s|ed|ing)?\b|\binitialize(?:s|d|ing)?\b|\bload(?:s|ed|ing)?\b|\bopen(?:s|ed|ing)?\b|\bconnect(?:s|ed|ing)?\b)\s+(.+?)\s+(?:after|subsequent to|later than|afterward)\s+(.+?)/i,

    // 5. "X depends on Y"
    /(.+?)\s+(?:depends on|relies on|contingent upon|requires|necessitates)\s+(.+?)/i,

    // 6. "Cannot call/invoke/execute/run/perform X until Y has been called/invoked"
    /(?:\bcannot\b|\bcan't\b|\bdo not\b|\bdon't\b|\bshould not\b|\bshouldn't\b|\bunable to\b).*?(?:\bcall(?:s|ed|ing)?\b|\binvoke(?:s|d|ing)?\b|\bexecute(?:s|d|ing)?\b|\brun(?:s|ning)?\b|\bperform(?:s|ed|ing)?\b)\s+(.+?)\s+(?:until|before|after|when|once|unless)\s+(.+?)\s+has.*?(?:\bcalled\b|\binvoked\b|\bexecuted\b|\brun\b|\bperformed\b)/i,

    // 7. "Must call/invoke/execute/run/perform X before Y"
    /(?:\bmust\b|\bneeds to\b|\bneed to\b|\bshould\b|\bhave to\b|\bought to\b|\brequired to\b|\bessential to\b|\bcrucial to\b)\s+(?:call|invoke|execute|run|perform)\s+(.+?)\s+(?:before|prior to|preceding|earlier than|ahead of|in advance of)\s+(.+?)/i,

    // 8. "Should call/invoke/execute/run/perform X after Y"
    /\bshould.*?\b(?:call|calls|called|calling|invoke|invokes|invoked|invoking|execute|executes|executed|executing|run|runs|ran|running|perform|performs|performed|performing).*?\b([\w]+\(.*?\)).*?\bafter.*?\b([\w]+\(.*?\))/i,

    // 9. "First X, followed by Y"
    /(?:\bfirst\b|\binitially\b|\bto start\b|\bbeginning with\b|\bat first\b)\s+(.+?),?\s+(?:followed by|then|next|afterward|subsequently|and then)\s+(.+?)/i,

    // 10. "Once X is called/invoked, proceed with Y"
    /(?:\bonce\b)\s+(.+?)\s+(?:is|has been)\s+(?:called|invoked|executed|run|performed),?\s+(?:proceed with|proceed to|continue to|go ahead and|move on to|be sure to|ensure that you)\s+(?:call|invoke|execute|run|perform)\s+(.+?)/i,

    // 11. "X should always precede Y"
    /(.+?)\s+(?:should|must|needs to)?\s*(?:always)?\s*(?:precede|come before)\s+(.+?)/i,

    // 12. "X cannot be called until Y"
    /(.+?)\s+(?:cannot|can't|should not|shouldn't|unable to)\s+be\s+(?:called|invoked|executed|run|performed)\s+(?:until|before|after|when|once|unless)\s+(.+?)/i,

    // 13. "Failure to call/invoke/execute/run/perform X before Y will cause"
    /(?:\bfailure to\b|\bneglecting to\b|\bomission of\b|\bnot\b|\bwithout\b)\s+(?:call|invoke|execute|run|perform)\s+(.+?)\s+(?:before|prior to|preceding|earlier than|ahead of|in advance of)\s+(.+?).*?(?:will cause|results in|leads to|triggers|causes|may result in)/i,

    // 14. "X is required before Y"
    /(.+?)\s+(?:is|are)\s+(?:required|essential|crucial)\s+(?:before|prior to|preceding|earlier than|ahead of|in advance of)\s+(.+?)/i,

    // 15. "Ensure/Make sure to call/invoke/execute/run/perform X before Y"
    /(?:\bensure\b|\bmake sure\b)\s+(?:to\s+)?(?:call|invoke|execute|run|perform)\s+(.+?)\s+(?:before|prior to|preceding|earlier than|ahead of|in advance of)\s+(.+?)/i,

    // 16. "Do/Perform X before Y"
    /(?:\bdo\b|\bperform\b)\s+(.+?)\s+(?:before|prior to|preceding|earlier than|ahead of|in advance of)\s+(.+?)/i,

    // 17. "You need to perform X first, followed by Y"
    /(?:\byou\b|\bwe\b|\bthey\b|\bone must\b)\s+(?:need to|must|should)\s+(?:perform|call|invoke|execute|run)\s+(.+?)\s+(?:first|initially|to start|beginning with|at first),?\s+(?:followed by|then|next|afterward|subsequently|and then)\s+(.+?)/i,

    // 18. "X must be called prior to invoking Y"
    /(.+?)\s+(?:must|needs to|need to|should|have to|ought to|required to)\s+be\s+(?:called|invoked|executed|run|performed)\s+(?:prior to|before|preceding|ahead of|earlier than|in advance of)\s+(?:calling|invoking|executing|running|performing)\s+(.+?)/i,

    // 19. Before Calling
    /(?:before|prior to|preceding|ahead of|earlier than|in advance of)\s+(?:calling|invoking|executing|running|performing)\s+(.+?),\s+(?:must|need to|needs to|should|have to|ought to|required to)\s+(?:call|invoke|execute|run|perform)\s+(.+?)/i,

    // 20. After Completing
    /(?:after|following|subsequent to|later than|afterward)\s+(?:completing|invoking|calling)\s+(.+?),\s+(?:proceed with|proceed to|continue to|go ahead and|move on to|be sure to|ensure that you)\s+(?:call|invoke|execute|run|perform)\s+(.+?)/i,

    // 21. Should Be Called Prior To
    /(.+?)\s+(?:should|must|needs to|need to|have to|ought to)\s+be\s+(?:called|invoked|executed|run|performed)\s+(?:prior to|before|preceding|ahead of|earlier than|in advance of)\s+(?:invoking|calling|executing|running|performing)\s+(.+?)/i,

    // 22. "Do not forget/miss to perform/invoke X"
    /(?:do not|don't|never|should not|must not)\s+(?:forget|miss|neglect|fail)\s+(?:to\s+)?(?:perform|invoke|call|free|close|execute)\s+(.+?)/i,

    // 23. "Remember to perform/invoke X"
    /(?:remember|reminder|be sure|make sure|ensure|always)\s+(?:to\s+)?(?:perform|invoke|call|free|close|execute)\s+(.+?)/i,

    // 24. "To avoid X, do Y"
    /(?:to avoid|to prevent|in order to avoid|in order to prevent)\s+(.+?),?\s*(?:do|call|invoke|execute|run|perform)\s+(.+?)/i,

    // 25. "If X, Y is unnecessary/redundant"
    /(?:if|when|in case)\s+(.+?),?\s*(?:doing\s+)?(.+?)\s*(?:is)?\s*(?:unnecessary|redundant|superfluous|pointless|ineffective)/i,

    // 26. "Keep in mind to do X"
    /(?:keep in mind|remember|note|be aware|ensure|make sure)\s+(?:that\s+)?(.+?)/i,

    // 27. "Recommended to do X"
    /(?:not\s+)?(?:recommended|advised|suggested|encouraged|discouraged|inadvisable|unadvisable)\s+(?:to\s+)?(.+?)/i,

    // 28. "Need to explicitly overwrite X"
    /(?:need to|must|should|have to|ought to)\s+(?:explicitly|manually)?\s*(?:overwrite|set|define|specify|provide)\s+(.+?)/i,

    // 29. "Must do X after Y"
    /(?:must|need to|should|have to|ought to|required to)\s+(?:call|invoke|execute|run|perform|do)\s+(.+?)\s+(?:after|once|when|afterward)\s+(.+?)/i,

    // 30. "Must do X at the end/eventually"
    /(?:must|need to|should|have to|ought to|required to)\s+(?:call|invoke|execute|run|perform|do)\s+(.+?)\s+(?:at the end|eventually|finally|after all operations)/i,

    // security threat hole malicious etc...
].reverse();

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
                        const sentences = split(text)
                        // Check each sentence for each keyword
                        sentences.forEach((sentenceNode: TxtParentNodeWithSentenceNodeContent) => {
                            if (sentenceNode.type !== 'Sentence') {
                                return
                            }
                            const sentence = sentenceNode.raw

                            const sentenceToCheck = sentence.replace(/(\r\n|\n|\r)/gm, " ")
                            console.log('##############\nChecking sentence: \n', sentenceToCheck)
                            for (const pattern of regexPatterns) {
                                if (sentenceToCheck.toLowerCase().match(pattern)) {
                                    console.log('Mattched!')
                                    allMatches.push({
                                        keyword: pattern.source,
                                        matchingSentence: sentence.trim(),
                                        pageUrl: url,
                                    });

                                    break;
                                }
                            }
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
