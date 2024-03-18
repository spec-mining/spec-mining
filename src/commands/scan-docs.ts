import axios from 'axios';
import cheerio from 'cheerio';

// Adjusted helper function to also take mainBaseUrl and check if the resolved link is within the main site
const resolveLink = (base: string, relative: string): string | null => {
    if (relative.startsWith('http')) {
      return relative;
    } else {
      const resolvedUrl = new URL(relative, base).toString();
      return resolvedUrl;
    }
};

const normalizeUrl = (url: string): string => {
    const normalizedUrl = new URL(url);

    // Normalize the scheme to lowercase
    normalizedUrl.protocol = normalizedUrl.protocol.toLowerCase();

    // Normalize the host to lowercase
    normalizedUrl.hostname = normalizedUrl.hostname.toLowerCase();

    // Remove default ports (http: 80, https: 443)
    if (normalizedUrl.port === '80' || normalizedUrl.port === '443') {
        normalizedUrl.port = '';
    }

    // Normalize the pathname to ensure a trailing slash for the root path
    normalizedUrl.pathname = normalizedUrl.pathname.replace(/\/?$/, '/');

    // Sort query parameters
    const params = new URLSearchParams(normalizedUrl.searchParams);
    const sortedParams = new URLSearchParams();
    Array.from(params.keys()).sort().forEach((key) => {
        sortedParams.set(key, params.get(key)!);
    });
    normalizedUrl.search = sortedParams.toString();

    // Ignore fragment identifiers
    normalizedUrl.hash = '';

    normalizedUrl.pathname = normalizedUrl.pathname.replace(/\/index\.html\/?$/, '/');

    return normalizedUrl.toString();
};

const directToAnotherWebsite = (rootLink: string, resolvedLink: string): boolean => {
    return !resolvedLink.startsWith(rootLink)
}


const findNestedLinks = async (mainLink: string): Promise<string[]> => {
  let linksToVisit: Set<string> = new Set([mainLink]);
  let normalizedVisitedLinks: Set<string> = new Set();
  let visitedLinks: Set<string> = new Set();

  // Ensure mainLink ends with a slash for consistent comparison
  const mainBaseUrl = mainLink.endsWith('/') ? mainLink : `${mainLink}/`;

  while (linksToVisit.size > 0) {
    const currentLink: string = linksToVisit.values().next().value;
    linksToVisit.delete(currentLink);

    if (normalizedVisitedLinks.has(normalizeUrl(currentLink))) {
      continue; // Skip if we've already visited this link
    }

    console.log(`Visiting: ${currentLink}`);
    normalizedVisitedLinks.add(normalizeUrl(currentLink));
    visitedLinks.add(currentLink)

    try {
      const response = await axios.get(currentLink);
      const $ = cheerio.load(response.data);
      $('a').each((_, element) => {
        const href = $(element).attr('href');
        const targetLink = resolveLink(currentLink, href || '');

        if (!targetLink
            || directToAnotherWebsite(mainBaseUrl, targetLink)
            || normalizedVisitedLinks.has(normalizeUrl(targetLink))
        ) {
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

export const scanDocs = async (linksFile: string, outDir: string) => {
    // Example usage
    try {
        const links = await findNestedLinks('https://www.crummy.com/software/BeautifulSoup/bs4/doc/');
        console.log('Found links:', links);
    } catch (error) {
        console.error('Error:', error);
    }
}