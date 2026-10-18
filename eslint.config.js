const globals = require('globals');

module.exports = [
    {
        files: ['**/*.js'],
        languageOptions: {
            sourceType: 'commonjs',
            ecmaVersion: 2021,
            globals: {
                ...globals.node,
                ...globals.commonjs
            }
        },
        linterOptions: {
            reportUnusedDisableDirectives: true
        },
        rules: {
            // Error prevention
            'no-console': 'warn',
            'no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
            'no-undef': 'error',
            'no-var': 'error',

            // Best practices
            'prefer-const': 'error',
            'eqeqeq': ['error', 'always'],
            'curly': ['error', 'all'],
            'no-multiple-empty-lines': ['error', { 'max': 1 }],

            // Style consistency
            'indent': ['error', 4],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
            'comma-dangle': ['error', 'never'],
            'object-curly-spacing': ['error', 'always'],

            // Error handling
            'no-throw-literal': 'error',
            'handle-callback-err': 'error',

            // Async/Promise handling
            'no-return-await': 'error',
            'require-await': 'error',
            'no-async-promise-executor': 'error',

            // MongoDB specific (for _id fields)
            'camelcase': ['error', { 'properties': 'never' }]
        }
    }
];
