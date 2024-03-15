export const libraryLists = [
  // ["scikit-learn", "SQLAlchemy", "NLTK", "SciPy"],
  // ["tensorflow", "PyTorch", "Keras", "Altair"],
  // ["Flask", "Django", "FastAPI", "requests"],
  // ["Seaborn", "Plotly", "Bokeh", "matplotlib"],
  ["SpaCy", "Gensim", "BeautifulSoup", "Tornado"],
  // ["PyGame", "Celery", "Pillow", "Folium"],
  // ["Plotnine", "pandas", "Streamlit", "Dash"],
  // ["PySpark", "numpy"],
];

const libraryNames: string[] = libraryLists[0];

export const adjectives: string[] = [
  "unexpected",
  "strange",
  "confusing",
  "weird",
  "random",
  "bizarre",
  "odd",
  "inconsistent",
  "tricky",
];

export const nouns: string[] = [
  "behavior",
  "output",
  "result",
  // "error",
  // "crash",
  // "failure",
  // "issue",
];

// Function to generate all combinations
const generateCombinations = (
  libraries: string[],
  adjectives: string[],
  nouns: string[]
): string[] => {
  const combinations: string[] = [];

  libraries.forEach((library) => {
    adjectives.forEach((adjective) => {
      nouns.forEach((noun) => {
        combinations.push(`${library} ${adjective} ${noun}`);
      });
    });
  });

  return combinations;
};

export const searchPhrases: string[] = generateCombinations(
  libraryNames,
  adjectives,
  nouns
);


type AnalysisResult = {
  analysis_results: Array<{
    issue_link: string; // URL of the issue on the platform
    ai_verdict: boolean; // Indicates whether an API of interest is involved
    reason: string; // Explanation of why the API is considered as such
    api_details?: {
      normal_conditions: string; // Description of the conditions under which the API works as expected
      trigger_conditions: string; // Specific runtime conditions or sequences of events that lead to the issue
      reason_for_difficulty_in_detection: string; // Why this issue might be challenging to detect during development and testing
      issue_description: string; // A concise explanation of the issue encountered with the API, including any error messages or incorrect behavior observed
      library_name: string; // Name of the library or framework containing the API
      api_name: string; // Specific API or function name, if applicable
    };
  }>;
};