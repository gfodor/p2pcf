/** @type {import('eslint').Linter.Config } */
module.exports = {
    root: true,
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
    },
    env: {
        browser: true,
        commonjs: true,
        node: true,
    },
    overrides: [
        { files: '*.d.ts', rules: { strict: ['error', 'never'] } },
        {
            files: ['.eslintrc.js'],
            rules: {
                'sort-keys': 'off',
            },
        },
    ],
    extends: ['eslint:recommended', 'plugin:node/recommended', 'plugin:prettier/recommended'],
    plugins: ['import'],
    rules: {
        'import/no-unresolved': 'error',
        'node/no-missing-import': 'off',
        'node/no-process-exit': 'off',
        'node/no-unpublished-require': 'off',
        'node/no-unsupported-features/es-syntax': 'off',
        'eqeqeq': ['error', 'smart'],
        'no-eval': 'error',
        'no-var': 'error',
        'semi': 'warn',
    },
    ignorePatterns: ['dist/*', 'public/*', 'configure-package.js'],
};
