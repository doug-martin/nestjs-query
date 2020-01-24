module.exports = {
    env: {
        node: true,
        jest: true,
    },

    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: './tsconfig.build.json',
    },
    plugins: [
        '@typescript-eslint',
        'prettier',
        'import',
        'jest',
        'eslint-plugin-tsdoc',
    ],
    extends: [
        'airbnb-base',
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'prettier/@typescript-eslint',
    ],
    ignorePatterns: ['**/dist', '**/node_modules'],
    rules: {
        "tsdoc/syntax": "warn",
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                'ts': 'never',
                'js': 'never',
            },
        ],
        'prettier/prettier': 'error',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-parameter-properties': 'off',
        // Needed for Nest injection
        'no-useless-constructor': 0,
        // Needed to import Nest Testing
        'import/no-extraneous-dependencies': 'off',
        'no-empty-function': 0,
        // C2FO Preference
        'func-names': [
            'error',
            'always',
        ],
        'max-len': [
            'error',
            150,
            2,
            {
                'ignoreComments': false,
                'ignoreRegExpLiterals': true,
                'ignoreStrings': true,
                'ignoreTemplateLiterals': true,
                'ignoreUrls': true,
            },
        ],
        // Just not practical
        'class-methods-use-this': 0,
        // Standard Nest class definition
        'import/prefer-default-export': 0,
        'max-classes-per-file': ['error', 5],
        'import/no-cycle': 0,
    },
    settings: {
        'import/extensions': [
            '.ts',
            '.js',
        ],
        'import/parsers': {
            '@typescript-eslint/parser': [
                '.ts',
            ],
        },
        'import/resolver': {
            node: {
                'extensions': [
                    '.ts',
                ],
            },
            typescript: {
                'alwaysTryTypes': true,
            },
        },
    },
    overrides: [
        {
            files: [
                '*.ts',
                '*.tsx',
            ],
            rules: {
                '@typescript-eslint/explicit-function-return-type': [
                    'error',
                    {
                        'allowExpressions': true,
                    },
                ],
            },
        },
        {
            files: [
                '*.spec.ts',
            ],
            rules: {
                '@typescript-eslint/explicit-function-return-type': 'off',
                '@typescript-eslint/ban-ts-ignore': 'off',
                '@typescript-eslint/no-non-null-assertion': 'off',
                '@typescript-eslint/no-explicit-any': 'off',
            },
        },
    ],
};
