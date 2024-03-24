monaco.languages.register({id: 'ExtendedObjectScript'});

/*
    comment: Used for comments.
    string: Used for string literals.
    keyword: Used for language keywords.
    number: Used for numbers.
    variable: Used for variables.
    function: Used for function names.
    invalid: Used for code that is invalid or has syntax errors.
    type: Used for data types.
    tag: Used for tags, like HTML tags.
    attribute: Used for attributes within tags.
    constant: Used for constants.
    operator: Used for operators.
 */

monaco.languages.setMonarchTokensProvider('ExtendedObjectScript', {

    ignoreCase: true,

    classWordsFirst: [
        'Class','ClassMethod', 'Parameter', 'Index', 'Property', 'Method', 'XData', 'Storage', 'Relationship', 'Query', 'Select', 'Include' ,'IncludeGenerator'
    ],

    classWordsOther: [
        'As','Include','IncludeGenerator','Extends'
    ],

    keywords: [
        'break','continue','close','do','else','for',
        'goto','halt','hang','if','job','kill',
        'merge','new','open','quit',
        'read','return','ret','set',
        'tstart','ts','tcommit','tc','trollback','tro','throw',
        'use','view','write','while','xecute',
        'zkill','zl','znspace','zn','ztrap','zwrite','zw','zzdump','zzwrite',
        'dim',
        'try', 'catch',
        'of', 'on', 'in'
    ],

    shorthand: [
        'b','c','d','e','f','g','h','i','j','k','m','n','o','q','r','s','u','v','w','x'
    ],

    functions: [
        '$ascii', '$bit', '$bitcount', '$bitfind', '$bitlogic', '$case', '$change', '$char', '$classmethod',
        '$classname', '$compile', '$d', '$data', '$decimal', '$double', '$e', '$extract', '$factor', '$find', '$fnumber',
        '$get', '$increment', '$inumber', '$isobject', '$isvaliddouble', '$isvalidnum', '$justify', '$length',
        '$list', '$listbuild', '$listdata', '$listfind', '$listfromstring', '$listget', '$listlength',
        '$listnext', '$listsame', '$listtostring', '$listupdate', '$listvalid', '$locate', '$match',
        '$method', '$name', '$nconvert', '$normalize', '$now', '$number', '$order', '$o', '$parameter', '$piece', '$p',
        '$prefetchoff', '$prefetchon', '$property', '$qlength', '$qsubscript', '$query', '$random', '$replace',
        '$reverse', '$sconvert', '$select', '$sequence', '$sortbegin', '$sortend', '$stack', '$text', '$t', '$s',
        '$translate', '$view', '$wascii', '$wchar', '$wextract', '$wfind', '$iswide', '$wlength', '$wreverse',
        '$xecute', '$zabs', '$zarccos', '$zarcsin', '$zarctan', '$zboolean', '$zconvert', '$zcos', '$zcot',
        '$zcrc', '$zcsc', '$zcyc', '$zdascii', '$zdate', '$zd', '$zdateh', '$zdatetime', '$zdatetimeh', '$zdchar',
        '$zexp', '$zf', '$zf', '$zhex', '$ziswide', '$zlascii', '$zlchar', '$zln', '$zlog', '$zname',
        '$zposition', '$zpower', '$zqascii', '$zqchar', '$zsearch', '$zsec', '$zseek', '$zsin', '$zsqr',
        '$zstrip', '$ztan', '$ztime', '$ztimeh', '$zversion', '$zwascii', '$zwchar', '$zwidth', '$zwpack',
        '$zwbpack', '$zwunpack', '$zwbunpack', '$zzenkaku', '$system.','$i', '$j', '$l', '$tr', '$zcvt', '$g',
        '$ll', '$li', '$lb', '$lg', '$zu', '$zdt', '$zobjref', '$zutil', '$c', '$lv', '$f', '$lfs', '$lf'
    ],

    specialVariables: [
        '$device','$ecode','$estack','$etrap','$halt','$horolog','$io','$job','$key','$namespace','$principal',
        '$quit','$roles','$stack','$storage','$system','$test','$this','$throwobj','$tlevel','$username','$x','$y',
        '$za','$zb','$zchild','$zeof','$zeos','$zerror','$zhorolog','$zio','$zjob','$zmode','$zname','$znspace',
        '$zorder','$zparent','$zpi','$zpos','$zreference','$zstorage','$ztimestamp','$ztimezone','$ztrap','$zversion',
        '$d','$ec','$es','$et','$j','$h','$k','$p','$q','$st','$s','$sy','$t','$tl','$zc','$ze','$zh','$zi','$zj','$zm','$zn','$zo','$zp','$zr','$zs','$zts','$ztz','$zt','$zv'
    ],

    sqlKeywordsSimple: [
        "FETCH","DECLARE","CURSOR","FOR","SELECT","FROM","WHERE","AND","OR","NOT","INTO","INSERT","INTO","VALUES","UPDATE","SET","DELETE","CREATE DATABASE","ALTER","DATABASE","CREATE","TABLE","DROP","INDEX","NULL","LIKE","IN","BETWEEN","JOIN","UNION","GROUP","ORDER","BY","HAVING","COUNT","AVG","SUM","MAX","MIN","AS","DISTINCT"
    ],

    typeKeywords: [
        '%numeric', '%string', '%integer', '%listofdatatypes', '%listofobjects', '%arrayofdatatypes', 'arrayofobjects', '%status', '%boolean', '%date', '%time', '%timestamp', 'list', 'array'
    ],

    operators: [
        "+","-","*","/","\\","**","#",
        "_","'",",",":","^",
        "=","'=",">","'>","<=","<","'<",">=",
        "[","]","]]",
        "&","&&","!","||","@","?"
    ],

    symbols:  /[\^\:\,\+\-\*\/\\\*\#\_\'\=\>\<\]\[\&\!\|\@\?]{1}/,

    tokenizer: {

        root: [
            {include:             '@whitespace'  },
            {include:             'common'       },
            [/"((?:""|[^"])*)"/,  'string'		 ],
            [/&sql/,              'type'         ],
            [/&html/,             'type'         ],
            [/[{}()\[\]]/,        'variable'     ],

            //XML
            [/<\/?[0-9a-z:-_]*>/, 'type' ],
            [/<\/?[a-z:-_]* [a-z]*=/, 'type' ],
            [/<!--[\s\S]*?-->/, 'comment' ],
            [/<!\[CDATA\[[\s\S]*?]]>/, 'comment' ],

            // Multi-line template string start
            [/`/, { token: 'string.quote', bracket: '@open', next: '@templateString' }],

            [/@symbols/, {
                cases: {
                    '@operators': 'variable',
                    '@default'  : ''
                }
            }]
        ],

        common: [

            // ##CLASS
            [/##class/,'keyword'],

            // CLASS KEYWORDS that hang on the first column, then make sure anything else is invalid
            [/^[A-Za-z]+/, {
                cases: {
                    '@classWordsFirst': 'keyword',
                    '@default': ''
                }
            }],

            // KEYWORDS - Capture the rest of the class keywords, invalidate first words that aren't in the first column,
            // capture general keywords and include type keywords for now until we have a custom theme for them
            [/[A-Za-z%][\w$]*/, {
                cases: {
                    '@classWordsOther': 'keyword',
                    '@keywords': 'keyword',
                    '@typeKeywords': 'type',
                    '@sqlKeywordsSimple': 'keyword'
                }
            }],

            // GLOBALS
            [/\^%?[A-Za-z][A-Za-z0-9.]*/, 'type'],

            // $$$MACROS
            [/\${3}[a-z0-9]+/,'variable'],

            //..MEMBERS
            [/\.{2}#?[a-z%][a-z0-9]*/,'type'],

            // $$EXTRINSIC FUNCTIONS
            [/\$\$[a-z]+/, {
                cases: {
                    '@default': ''
                }
            }],

            // $INTRINSIC FUNCTIONS AND SPECIAL VARIABLES
            [/\$[a-z]+/, {
                cases: {
                    '@functions': 'type',
                    '@specialVariables': 'type',
                    '@default': 'invalid'
                }
            }],

            // numbers
            [/\d*\.\d+([eE][\-+]?\d+)?/, 'number'],
            [/\d+/, 'number'],

        ],

        templateString: [
            [/\\`/, 'string.escape'], // Escaped backtick
            [/\{\{\/?[^\}]+\}\}/, { cases: {
                    '@default': 'variable', // Default Handlebars expression
                    '/\\{\\{#\\S+?\\s/': 'keyword', // Handlebars command starting with #
                    '/\\{\\{\\/\\S+?\\s/': 'keyword', // Handlebars command starting with /
                    '\\}\\}': 'keyword' // Closing handlebars
                }}],
            [/`/, { token: 'string.quote', bracket: '@close', next: '@pop' }], // End of template string
            [/./, 'string'] // Regular string content
        ],

        whitespace: [
            [/[ \t\r\n]+/, ''],
            [/\/\*/, 'comment', '@mlcomment'],
            [/\/\/\s*TODO.*$/,'invalid'],
            [/\/\/\/\s*TODO.*$/,'invalid'],
            [/\/\/.*$/, 'comment'],
            [/\/\/\/.*$/, 'comment'],
            [/;.*$/, 'comment'],
            [/#;.*$/, 'comment'],
            [/<script language="JavaScript">/, 'type', '@script'],
            [/<script/, 'type', '@script'],
            [/<style>/, 'type', '@style']
        ],

        mlcomment: [
            [/[^\/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[\/*]/, 'comment'],
        ],

        script: [
            [/<\/script>/, 'type', '@pop']
        ],

        style: [
            [/<\/style>/, 'type', '@pop']
        ],

    }

})
















