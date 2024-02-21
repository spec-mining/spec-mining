const libraryLists = [
    ['scikit-learn', 'SQLAlchemy', 'NLTK', 'SciPy'],
    ['Flask', 'Django', 'FastAPI', 'requests'],
    ['tensorflow', 'PyTorch', 'Keras', 'Altair'],
    ['Seaborn', 'Plotly', 'Bokeh', 'matplotlib'],
    ['SpaCy', 'Gensim', 'BeautifulSoup', 'Tornado'],
    ['PyGame', 'Celery', 'Pillow', 'Folium'],
    ['Plotnine', 'pandas', 'Streamlit', 'Dash'],
    ['PySpark', 'numpy']
]

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
    "issue"
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
  }
  
  
  export const searchPhrases: string[] = generateCombinations(libraryNames, adjectives, nouns);
  
  console.log(searchPhrases);
  