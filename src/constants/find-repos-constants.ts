export type SpecID = {
    specName: string,
    regexQuery: string,
    githubQuery: string,
    dependencyName: string
}

export const specIDList: Array<SpecID> = [
    {
        specName: 'ArgParse_Parent',
        regexQuery: '/argparse/ AND /ArgumentParser\((?:[^()]*|\([^()]*\))*\)/ AND /add_argument\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'argparse AND ArgumentParser( AND add_argument(',
        dependencyName: 'pydocs'
    },
    {
        specName: 'Arrays_Comparable',
        regexQuery: '/sorted\((?:[^()]*|\([^()]*\))*\)/ OR /\.sort\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'sorted( OR .sort(',
        dependencyName: 'pydocs'
    },
    {
        specName: 'Console_CloseErrorWriter',
        regexQuery: '/stderr.close\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'stderr AND close(',
        dependencyName: 'pydocs'
    },
    {
        specName: 'Console_CloseReader',
        regexQuery: '/stdin.close\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'stdin AND close(',
        dependencyName: 'pydocs'
    },
    {
        specName: 'Console_CloseWriter',
        regexQuery: '/stdout.close\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'stdout AND close(',
        dependencyName: 'pydocs'
    },
    {
        specName: 'CreateWidgetOnSameFrameCanvas',
        regexQuery: 'nltk AND /add_widget\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'nltk AND add_widget(',
        dependencyName: 'nltk'
    },
    {
        specName: 'DataMustOpenInBinary',
        regexQuery: 'requests AND /post\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'requests AND post(',
        dependencyName: 'requests'
    },
    {
        specName: 'faulthandler_disableBeforeClose',
        regexQuery: '/faulthandler.enable\((?:[^()]*|\([^()]*\))*\)/ AND /close\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'faulthandler.enable( AND close(',
        dependencyName: 'pydocs'
    },
    {
        specName: 'faulthandler_tracetrackDumpBeforeClose',
        regexQuery: '/dump_traceback_later\((?:[^()]*|\([^()]*\))*\)/ AND /close\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'dump_traceback_later( AND close(',
        dependencyName: 'pydocs'
    },
    {
        specName: 'faulthandler_unregisterBeforeClose',
        regexQuery: '/faulthandler.register\((?:[^()]*|\([^()]*\))*\)/ AND /close\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'faulthandler.register( AND close(',
        dependencyName: 'pydocs'
    },
    {
        specName: 'File_MustClose',
        regexQuery: '/open\((?:[^()]*|\([^()]*\))*\)/ NOT /with open\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'open( AND NOT with open(',
        dependencyName: 'pydocs'
    },
    {
        specName: 'HostnamesTerminatesWithSlash',
        regexQuery: 'requests AND Session AND /mount\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'requests AND Session AND mount(',
        dependencyName: 'requests'
    },
    {
        specName: 'NLTK_MissingMegamArgs',
        regexQuery: 'nltk AND /write_megam_file\((?:[^()]*|\([^()]*\))*\)/ AND /call_megam\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'nltk AND write_megam_file( AND call_megam(',
        dependencyName: 'nltk'
    },
    {
        specName: 'NLTK_MustImplementEntries',
        regexQuery: 'nltk AND /IBMModel1\((?:[^()]*|\([^()]*\))*\)/ OR /IBMModel2\((?:[^()]*|\([^()]*\))*\)/ OR /IBMModel3\((?:[^()]*|\([^()]*\))*\)/ OR /IBMModel4\((?:[^()]*|\([^()]*\))*\)/ OR /IBMModel5\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'nltk AND IBMModel1( OR IBMModel2( OR IBMModel3( OR IBMModel4( OR IBMModel5(',
        dependencyName: 'nltk'
    },
    {
        specName: 'NLTK_MutableProbDistSumToOne',
        regexQuery: 'nltk AND /MutableProbDist\((?:[^()]*|\([^()]*\))*\)/ AND /\.update\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'nltk AND MutableProbDist( AND .update(',
        dependencyName: 'nltk'
    },
    {
        specName: 'NLTK_NonterminalSymbolMutability',
        regexQuery: 'nltk AND /Nonterminal\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'nltk AND Nonterminal(',
        dependencyName: 'nltk'
    },
    {
        specName: 'NLTK_regexp_span_tokenize',
        regexQuery: 'nltk AND /regexp_span_tokenize\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'nltk AND regexp_span_tokenize(',
        dependencyName: 'nltk'
    },
    {
        specName: 'NLTK_RegexpTokenizerCapturingParentheses',
        regexQuery: 'nltk AND /RegexpTokenizer\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'nltk AND RegexpTokenizer(',
        dependencyName: 'nltk'
    },
    {
        specName: 'PriorityQueue_NonComparable',
        regexQuery: 'heapq AND /\.heappush\((?:[^()]*|\([^()]*\))*\)/)',
        githubQuery: 'heapq AND .heappush(',
        dependencyName: 'heapq'
    },
    {
        specName: 'PriorityQueue_NonComparable',
        regexQuery: '/\._put\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: '._put(',
        dependencyName: 'pydocs'
    },
    {
        specName: 'RandomMustUseSeed',
        regexQuery: '/random.*\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'random AND (',
        dependencyName: 'pydocs'
    },
    {
        specName: 'RandomParams_NoPositives',
        regexQuery: '/random.lognormvariate\((?:[^()]*|\([^()]*\))*\)/ OR /random.vonmisesvariate\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'random.lognormvariate( OR random.vonmisesvariate(',
        dependencyName: 'pydocs'
    },
    {
        specName: 'RandomRandrange_MustNotUseKwargs',
        regexQuery: '/random.randrange\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'random.randrange(',
        dependencyName: 'pydocs'
    },
    {
        specName: 'Requests_PreparedRequestInit',
        regexQuery: '/requests.PreparedRequest\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'requests.PreparedRequest(',
        dependencyName: 'requests'
    },
    {
        specName: 'StringTemplate_ChangeAfterCreate',
        regexQuery: '/\.delimiter = .+/',
        githubQuery: '.delimiter = ',
        dependencyName: 'pydocs'
    },
    {
        specName: 'TfFunction_NoSideEffect',
        regexQuery: '/@tf\.function\s*\n\s*def\s+\w+\s*\(.*?\):\s*(?:[^\{]*\{[^\}]*\})?.*?open\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: '@tf.function AND def AND open(',
        dependencyName: 'tensorflow'
    },
    {
        specName: 'TfFunction_NoSideEffect',
        regexQuery: '/@tf\.function\s*\n\s*def\s+\w+\s*\(.*?\):\s*(?:[^\{]*\{[^\}]*\})?.*?print\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: '@tf.function AND def AND print(',
        dependencyName: 'tensorflow'
    },
    {
        specName: 'Thread_StartOnce',
        regexQuery: '/threading.Thread\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'threading.Thread(',
        dependencyName: 'pydocs'
    },
    {
        specName: 'UseProtp_in_FTP_TLS',
        regexQuery: 'ftplib AND /FTP_TLS\((?:[^()]*|\([^()]*\))*\)/ OR /ftplib.FTP_TLS\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'ftplib AND FTP_TLS( OR ftplib.FTP_TLS(',
        dependencyName: 'ftplib'
    },
    {
        specName: 'VerifyPathProcessed',
        regexQuery: 'requests AND /Session\((?:[^()]*|\([^()]*\))*\)/ OR /requests.Session\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'requests AND Session( OR requests.Session(',
        dependencyName: 'requests'
    },
    {
        specName: 'XMLParser_ParseMustFinalize',
        regexQuery: 'xml AND parsers AND expat AND /ParserCreate\((?:[^()]*|\([^()]*\))*\)/',
        githubQuery: 'xml AND parsers AND expat AND ParserCreate(',
        dependencyName: 'pydocs'
    }
]


