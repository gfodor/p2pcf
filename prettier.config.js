/** @type {import('prettier').Config} */
const overrides = {
    overrides: [
        {
            files: ['*.yml', '*.yaml'],
            options: { tabWidth: 2 },
        },
        {
            files: '.madgerc',
            options: { parser: 'json' },
        },
        {
            files: '.eslintrc.js',
            options: { quoteProps: 'consistent' },
        },
    ],
};

/** @type {import('prettier').Options} */
module.exports = {
    arrowParens: 'avoid',
    bracketSameLine: true,
    bracketSpacing: true,
    htmlWhitespaceSensitivity: 'css',
    insertPragma: false,
    jsxSingleQuote: false,
    ...overrides,
    printWidth: 120,
    proseWrap: 'preserve',
    quoteProps: 'as-needed',
    requirePragma: false,
    semi: true,
    singleQuote: true,
    tabWidth: 4,
    trailingComma: 'all',
    useTabs: false,
};
