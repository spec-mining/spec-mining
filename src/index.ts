import yargs, { alias } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { collectData } from './collect-data'
import { removeRepetition } from './remove-repetition';
import { analyzeData } from './analyze-data';

const argv = await (yargs(hideBin(process.argv))
  .option('collect', {
    alias: 'c',
    type: 'boolean',
    description: 'Collect data',
  })
  .option('analyze', {
    alias: 'a',
    type: 'boolean',
    description: 'Analyze data',
  })
  .option('removeRepetition', {
    alias: 'r',
    type: 'boolean',
    description: 'Remove repetition',
  })
  .option('outFile', {
    alias: 'o',
    type: 'string',
    description: 'Output file',
  })
  .option('inFile', {
    alias: 'i',
    type: 'string',
    description: 'Input file',
  })
  .option('startPage', {
    type: 'number',
    description: 'Start page'
  })
  .option('endPage', {
    type: 'number',
    description: 'End page'
  })
  .option('startAnalyzeIndex', {
    alias: 's',
    type: 'number',
    description: 'Start analyze index'
  })
  .option('endAnalyzeIndex', {
    alias: 'e',
    type: 'number',
    description: 'End analyze index'
  })
  .parse());

const DEFAULT_COLLECT_IN_FILE = './out/collected_issues.csv';
const DEFAULT_COLLECT_OUT_FILE = './out/collected_issues.csv';
const DEFAULT_ANALYZE_OUT_FILE = './out/analyzed_issues.csv';
const DEFAULT_START_PAGE = 1;
const DEFAULT_END_PAGE = 1;

if (argv.collect) {

  if (!argv.outFile) {
    console.log('No output file specified, using default:', DEFAULT_COLLECT_OUT_FILE);
    argv.outFile = DEFAULT_COLLECT_OUT_FILE;
  }

  if (argv.startPage === undefined) {
    console.log('No start page specified, using default:', DEFAULT_START_PAGE);
    argv.startPage = DEFAULT_START_PAGE;
  }

  if (argv.endPage === undefined) {
    console.log('No end page specified, using default:', DEFAULT_END_PAGE);
    argv.endPage = DEFAULT_END_PAGE;
  }

  collectData(argv.outFile, argv.startPage, argv.endPage).finally(() => {
    argv.outFile && removeRepetition(argv.outFile);
  })
}

if (argv.removeRepetition) {
  console.log('Removing repetition');
  removeRepetition(argv.inFile || DEFAULT_COLLECT_IN_FILE);
}

if (argv.analyze) {
  console.log('Analyzing data');
  if (!argv.inFile) {
    console.log('No input file specified, using default:', DEFAULT_COLLECT_OUT_FILE);
    argv.inFile = DEFAULT_COLLECT_OUT_FILE;
  }

  if (!argv.outFile) {
    console.log('No output file specified, using default:', DEFAULT_ANALYZE_OUT_FILE);
    argv.outFile = DEFAULT_ANALYZE_OUT_FILE;
  }

  if (argv.startAnalyzeIndex === undefined || argv.endAnalyzeIndex === undefined) {
    throw new Error('Start and end analyze index must be specified');
  }

  analyzeData(argv.inFile, argv.outFile, argv.startAnalyzeIndex, argv.endAnalyzeIndex);
}