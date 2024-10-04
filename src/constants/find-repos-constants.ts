export type SpecID = {
    specName: string,
    regexQuery: string,
    githubQuery: string,
    dependencyName: string
}

export const specIDList: Array<SpecID> = [
    // {
    //     specName: 'ArgParse_Parent',
    //     regexQuery: '/argparse/ AND /ArgumentParser\((?:[^()]*|\([^()]*\))*\)/ AND /add_argument\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'argparse AND ArgumentParser( AND add_argument(',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'Arrays_Comparable',
    //     regexQuery: '/sorted\((?:[^()]*|\([^()]*\))*\)/ OR /\.sort\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'sorted( OR .sort(',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'Console_CloseErrorWriter',
    //     regexQuery: '/stderr.close\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'stderr AND close(',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'Console_CloseReader',
    //     regexQuery: '/stdin.close\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'stdin AND close(',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'Console_CloseWriter',
    //     regexQuery: '/stdout.close\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'stdout AND close(',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'CreateWidgetOnSameFrameCanvas',
    //     regexQuery: 'nltk AND /add_widget\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'nltk AND add_widget(',
    //     dependencyName: 'nltk'
    // },
    // {
    //     specName: 'DataMustOpenInBinary',
    //     regexQuery: 'requests AND /post\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'requests AND post(',
    //     dependencyName: 'requests'
    // },
    // {
    //     specName: 'faulthandler_disableBeforeClose',
    //     regexQuery: '/faulthandler.enable\((?:[^()]*|\([^()]*\))*\)/ AND /close\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'faulthandler.enable( AND close(',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'faulthandler_tracetrackDumpBeforeClose',
    //     regexQuery: '/dump_traceback_later\((?:[^()]*|\([^()]*\))*\)/ AND /close\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'dump_traceback_later( AND close(',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'faulthandler_unregisterBeforeClose',
    //     regexQuery: '/faulthandler.register\((?:[^()]*|\([^()]*\))*\)/ AND /close\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'faulthandler.register( AND close(',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'File_MustClose',
    //     regexQuery: '/open\((?:[^()]*|\([^()]*\))*\)/ NOT /with open\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'open( AND NOT with open(',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'HostnamesTerminatesWithSlash',
    //     regexQuery: 'requests AND Session AND /mount\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'requests AND Session AND mount(',
    //     dependencyName: 'requests'
    // },
    // {
    //     specName: 'NLTK_MissingMegamArgs',
    //     regexQuery: 'nltk AND /write_megam_file\((?:[^()]*|\([^()]*\))*\)/ AND /call_megam\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'nltk AND write_megam_file( AND call_megam(',
    //     dependencyName: 'nltk'
    // },
    // {
    //     specName: 'NLTK_MustImplementEntries',
    //     regexQuery: 'nltk AND /IBMModel1\((?:[^()]*|\([^()]*\))*\)/ OR /IBMModel2\((?:[^()]*|\([^()]*\))*\)/ OR /IBMModel3\((?:[^()]*|\([^()]*\))*\)/ OR /IBMModel4\((?:[^()]*|\([^()]*\))*\)/ OR /IBMModel5\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'nltk AND IBMModel1 OR IBMModel2 OR IBMModel3 OR IBMModel4 OR IBMModel5',
    //     dependencyName: 'nltk'
    // },
    // {
    //     specName: 'NLTK_MutableProbDistSumToOne',
    //     regexQuery: 'nltk AND /MutableProbDist\((?:[^()]*|\([^()]*\))*\)/ AND /\.update\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'nltk AND MutableProbDist( AND .update(',
    //     dependencyName: 'nltk'
    // },
    // {
    //     specName: 'NLTK_NonterminalSymbolMutability',
    //     regexQuery: 'nltk AND /Nonterminal\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'nltk AND Nonterminal(',
    //     dependencyName: 'nltk'
    // },
    // {
    //     specName: 'NLTK_regexp_span_tokenize',
    //     regexQuery: 'nltk AND /regexp_span_tokenize\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'nltk AND regexp_span_tokenize(',
    //     dependencyName: 'nltk'
    // },
    // {
    //     specName: 'NLTK_RegexpTokenizerCapturingParentheses',
    //     regexQuery: 'nltk AND /RegexpTokenizer\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'nltk AND RegexpTokenizer(',
    //     dependencyName: 'nltk'
    // },
    // {
    //     specName: 'PriorityQueue_NonComparable',
    //     regexQuery: 'heapq AND /\.heappush\((?:[^()]*|\([^()]*\))*\)/)',
    //     githubQuery: 'heapq AND .heappush(',
    //     dependencyName: 'heapq'
    // },
    // {
    //     specName: 'PriorityQueue_NonComparable',
    //     regexQuery: '/\._put\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: '._put(',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'RandomMustUseSeed',
    //     regexQuery: '/random.*\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'random AND (',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'RandomParams_NoPositives',
    //     regexQuery: '/random.lognormvariate\((?:[^()]*|\([^()]*\))*\)/ OR /random.vonmisesvariate\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'random.lognormvariate( OR random.vonmisesvariate(',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'RandomRandrange_MustNotUseKwargs',
    //     regexQuery: '/random.randrange\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'random.randrange(',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'Requests_PreparedRequestInit',
    //     regexQuery: '/requests.PreparedRequest\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'requests.PreparedRequest(',
    //     dependencyName: 'requests'
    // },
    // {
    //     specName: 'StringTemplate_ChangeAfterCreate',
    //     regexQuery: '/\.delimiter = .+/',
    //     githubQuery: '.delimiter = ',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'TfFunction_NoSideEffect',
    //     regexQuery: '/@tf\.function\s*\n\s*def\s+\w+\s*\(.*?\):\s*(?:[^\{]*\{[^\}]*\})?.*?open\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: '@tf.function AND def AND open(',
    //     dependencyName: 'tensorflow'
    // },
    // {
    //     specName: 'TfFunction_NoSideEffect',
    //     regexQuery: '/@tf\.function\s*\n\s*def\s+\w+\s*\(.*?\):\s*(?:[^\{]*\{[^\}]*\})?.*?append\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: '@tf.function AND def AND append(',
    //     dependencyName: 'tensorflow'
    // },    
    // {
    //     specName: 'TfFunction_NoSideEffect',
    //     regexQuery: '/@tf\.function\s*\n\s*def\s+\w+\s*\(.*?\):\s*(?:[^\{]*\{[^\}]*\})?.*?print\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: '@tf.function AND def AND print(',
    //     dependencyName: 'tensorflow'
    // },
    // {
    //     specName: 'Turtle_LastStatementDone',
    //     regexQuery: '/turtle.done\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'turtle.done()',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'Scipy_IntegrateRange',
    //     regexQuery: 'scipy AND /quad\((?:[^()]*|\([^()]*\))*\)/ OR /integrate.quad\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'scipy AND integrate AND quad(',
    //     dependencyName: 'scipy'
    // },
    // {
    //     specName: 'Thread_StartOnce',
    //     regexQuery: '/threading.Thread\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'threading.Thread(',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'UseProtp_in_FTP_TLS',
    //     regexQuery: 'ftplib AND /FTP_TLS\((?:[^()]*|\([^()]*\))*\)/ OR /ftplib.FTP_TLS\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'ftplib AND FTP_TLS( OR ftplib.FTP_TLS(',
    //     dependencyName: 'ftplib'
    // },
    // {
    //     specName: 'VerifyPathProcessed',
    //     regexQuery: 'requests AND /Session\((?:[^()]*|\([^()]*\))*\)/ OR /requests.Session\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'requests AND Session( OR requests.Session(',
    //     dependencyName: 'requests'
    // },
    // {
    //     specName: 'XMLParser_ParseMustFinalize',
    //     regexQuery: 'xml AND parsers AND expat AND /ParserCreate\((?:[^()]*|\([^()]*\))*\)/',
    //     githubQuery: 'xml AND parsers AND expat AND ParserCreate(',
    //     dependencyName: 'pydocs'
    // },
    // {
    //     specName: 'Flask_NoModifyAfterServe',
    //     regexQuery: 'flask AND /.config\[(?:[^\[\]]*|\[[^\[\]]*\])*\]/',
    //     githubQuery: 'flask AND .config[',
    //     dependencyName: 'flask'
    // },
    // {
    //     specName: 'Flask_NoOptionsChangeAfterEnvCreate',
    //     regexQuery: 'flask AND /.jinja_options\[(?:[^\[\]]*|\[[^\[\]]*\])*\] =/',
    //     githubQuery: 'flask AND .config[ =',
    //     dependencyName: 'flask'
    // },
    // Lowercase letters 'a' to 'z'
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(a',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(b',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(c',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(d',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(e',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(f',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(g',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(h',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(i',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(j',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(k',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(l',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(m',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(n',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(o',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(p',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(q',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(r',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(s',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(t',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(u',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(v',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(w',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(x',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(y',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(z',
        dependencyName: 'flask'
    },
    // Uppercase letters 'A' to 'Z'
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(A',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(B',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(C',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(D',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(E',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(F',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(G',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(H',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(I',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(J',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(K',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(L',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(M',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(N',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(O',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(P',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(Q',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(R',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(S',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(T',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(U',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(V',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(W',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(X',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(Y',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(Z',
        dependencyName: 'flask'
    },
    // Underscore '_'
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(_',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(f\'',
        dependencyName: 'flask'
    },
    {
        specName: 'Flask_UnsafeFilePath',
        regexQuery: 'flask AND /send_file\\(\\s*([a-zA-Z_][a-zA-Z0-9_]*)/',
        githubQuery: 'flask AND send_file(f"',
        dependencyName: 'flask'
    },
]


