export type SpecID = {
    specName: string,
    regexQuery: string,
    dependencyName: string
}

export const specIDList: Array<SpecID> = [
    {
        specName: 'ArgParse_Parent',
        regexQuery: '/argparse/ AND /ArgumentParser\((?:[^()]*|\([^()]*\))*\)/ AND /add_argument\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: ''
    },
    // {
    //     dependencyName: 'Arrays_Comparable',
    //     regexQuery: '/sorted\((?:[^()]*|\([^()]*\))*\)/ OR /\.sort\((?:[^()]*|\([^()]*\))*\)/',
    //     specName: ''
    // },
    {
        specName: 'Console_CloseErrorWriter',
        regexQuery: '/stderr.close\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: ''
    },
    {
        specName: 'Console_CloseReader',
        regexQuery: '/stdin.close\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: ''
    },
    {
        specName: 'Console_CloseWriter',
        regexQuery: '/stdout.close\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: ''
    },
    {
        specName: 'CreateWidgetOnSameFrameCanvas',
        regexQuery: 'nltk AND /add_widget\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: 'nltk'
    },
    {
        specName: 'DataMustOpenInBinary',
        regexQuery: 'requests AND /post\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: 'requests'
    },
    {
        specName: 'faulthandler_disableBeforeClose',
        regexQuery: '/faulthandler.enable\((?:[^()]*|\([^()]*\))*\)/ AND /close\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: ''
    },
    {
        specName: 'faulthandler_tracetrackDumpBeforeClose',
        regexQuery: '/dump_traceback_later\((?:[^()]*|\([^()]*\))*\)/ AND /close\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: ''
    },
    {
        specName: 'faulthandler_unregisterBeforeClose',
        regexQuery: '/faulthandler.register\((?:[^()]*|\([^()]*\))*\)/ AND /close\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: ''
    },
    {
        specName: 'File_MustClose',
        regexQuery: '/open\((?:[^()]*|\([^()]*\))*\)/ NOT /with open\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: ''
    },
    {
        specName: 'HostnamesTerminatesWithSlash',
        regexQuery: 'requests AND Session AND /mount\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: 'requests'
    },
    {
        specName: 'NLTK_MissingMegamArgs',
        regexQuery: 'nltk AND /write_megam_file\((?:[^()]*|\([^()]*\))*\)/ AND /call_megam\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: 'nltk'
    },
    {
        specName: 'NLTK_MustImplementEntries',
        regexQuery: 'nltk AND /IBMModel1\((?:[^()]*|\([^()]*\))*\)/ OR /IBMModel2\((?:[^()]*|\([^()]*\))*\)/ OR /IBMModel3\((?:[^()]*|\([^()]*\))*\)/ OR /IBMModel4\((?:[^()]*|\([^()]*\))*\)/ OR /IBMModel5\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: 'nltk'
    },
    {
        specName: 'NLTK_MutableProbDistSumToOne',
        regexQuery: 'nltk AND /MutableProbDist\((?:[^()]*|\([^()]*\))*\)/ AND /\.update\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: 'nltk'
    },
    {
        specName: 'NLTK_NonterminalSymbolMutability',
        regexQuery: 'nltk AND /Nonterminal\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: 'nltk'
    },
    {
        specName: 'NLTK_regexp_span_tokenize',
        regexQuery: 'nltk AND /regexp_span_tokenize\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: 'nltk'
    },
    {
        specName: 'NLTK_RegexpTokenizerCapturingParentheses',
        regexQuery: 'nltk AND /RegexpTokenizer\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: 'nltk'
    },
    {
        specName: 'PriorityQueue_NonComparable',
        regexQuery: '(heapq AND /\.heappush\((?:[^()]*|\([^()]*\))*\)/)',
        dependencyName: 'heapq'
    },
    {
        specName: 'PriorityQueue_NonComparable',
        regexQuery: '/\._put\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: ''
    },
    {
        specName: 'RandomMustUseSeed',
        regexQuery: '/ random.*\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: ''
    },
    {
        specName: 'RandomParams_NoPositives',
        regexQuery: '/random.lognormvariate\((?:[^()]*|\([^()]*\))*\)/ OR /random.vonmisesvariate\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: ''
    },
    {
        specName: 'RandomRandrange_MustNotUseKwargs',
        regexQuery: '/random.randrange\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: ''
    },
    {
        specName: 'Requests_PreparedRequestInit',
        regexQuery: '/requests.PreparedRequest\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: 'requests'
    },
    {
        specName: 'StringTemplate_ChangeAfterCreate',
        regexQuery: '/\.delimiter = .+/',
        dependencyName: ''
    },
    {
        specName: 'TfFunction_NoSideEffect',
        regexQuery: '/@tf\.function\s*\n\s*def\s+\w+\s*\(.*?\):\s*(?:[^\{]*\{[^\}]*\})?.*?open\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: 'tensorflow'
    },
    {
        specName: 'TfFunction_NoSideEffect',
        regexQuery: '/@tf\.function\s*\n\s*def\s+\w+\s*\(.*?\):\s*(?:[^\{]*\{[^\}]*\})?.*?print\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: 'tensorflow'
    },
    {
        specName: 'Thread_StartOnce',
        regexQuery: '/threading.Thread\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: ''
    },
    {
        specName: 'UseProtp_in_FTP_TLS',
        regexQuery: 'ftplib AND /FTP_TLS\((?:[^()]*|\([^()]*\))*\)/ OR /ftplib.FTP_TLS\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: 'ftplib'
    },
    {
        specName: 'VerifyPathProcessed',
        regexQuery: 'requests AND /Session\((?:[^()]*|\([^()]*\))*\)/ OR /requests.Session\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: 'requests'
    },
    {
        specName: 'XMLParser_ParseMustFinalize',
        regexQuery: 'xml AND parsers AND expat AND /ParserCreate\((?:[^()]*|\([^()]*\))*\)/',
        dependencyName: ''
    }
]


