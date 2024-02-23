const libraryLists = [
  ["scikit-learn", "SQLAlchemy", "NLTK", "SciPy"],
  ["Flask", "Django", "FastAPI", "requests"],
  ["tensorflow", "PyTorch", "Keras", "Altair"],
  ["Seaborn", "Plotly", "Bokeh", "matplotlib"],
  ["SpaCy", "Gensim", "BeautifulSoup", "Tornado"],
  ["PyGame", "Celery", "Pillow", "Folium"],
  ["Plotnine", "pandas", "Streamlit", "Dash"],
  ["PySpark", "numpy"],
];

const libraryNames: string[] = libraryLists[0];

const adjectives: string[] = [
  "unexpected",
  "strange",
  // "weird",
  // "random",
  // "bizarre",
  // "odd",
  // "inconsistent"
];

const nouns: string[] = [
  "behavior",
  // "output",
  "result",
  // "error",
  // "crash",
  // "failure",
  "issue",
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
    problematic_api_exist: boolean; // Indicates whether a problematic API is involved
    reason: string; // Explanation of why the API is considered problematic or not
    api_details?: {
      library_name: string; // Name of the library or framework containing the API
      api_name: string; // Specific API or function name, if applicable
      issue_description?: string; // A concise explanation of the issue encountered with the API, including any error messages or incorrect behavior observed
      expected_vs_actual_behavior?: string; // Description of what the API is supposed to do under normal conditions contrasted with what actually happens
      trigger_conditions?: string; // Specific runtime conditions or sequences of events that lead to the issue
      reason_for_difficulty_in_detection?: string; // Why this issue might be challenging to detect during development and testing
    };
  }>;
};