import yargs, { alias } from 'yargs';
import { hideBin } from 'yargs/helpers';
import { collectData } from './collect-data'
import { removeRepetition } from './remove-repetition';

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
    alias: 's',
    type: 'number',
    description: 'Start page'
  })
  .option('endPage', {
    alias: 'e',
    type: 'number',
    description: 'End page'
  })
  .option('startAnalyzeIndex', {
    type: 'number',
    description: 'Start analyze index'
  })
  .option('endAnalyzeIndex', {
    type: 'number',
    description: 'End analyze index'
  })
  .parse());

const DEFAULT_OUT_FILE = './out/collected_issues.csv';
const DEFAULT_IN_FILE = './out/collected_issues.csv';
const DEFAULT_START_PAGE = 1;
const DEFAULT_END_PAGE = 1;

if (argv.collect) {

  if (!argv.outFile) {
    console.log('No output file specified, using default:', DEFAULT_OUT_FILE);
    argv.outFile = DEFAULT_OUT_FILE;
  }

  if (!argv.startPage) {
    console.log('No start page specified, using default:', DEFAULT_START_PAGE);
    argv.startPage = DEFAULT_START_PAGE;
  }

  if (!argv.endPage) {
    console.log('No end page specified, using default:', DEFAULT_END_PAGE);
    argv.endPage = DEFAULT_END_PAGE;
  }

  collectData(argv.outFile, argv.startPage, argv.endPage);
}

if (argv.removeRepetition) {
  console.log('Removing repetition');
  removeRepetition(argv.inFile || DEFAULT_IN_FILE);
}

if (argv.analyze) {
  console.log('Analyzing data');
  // analyzeData(argv.inFile);
}