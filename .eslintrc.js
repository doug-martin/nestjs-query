module.exports = {
  env: {
    node: true,
    jest: true,
  },

  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.build.json',
  },
  plugins: ['@typescript-eslint', 'prettier', 'import', 'jest', 'eslint-plugin-tsdoc'],
  extends: [
    'airbnb-typescript/base',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'prettier',
    'prettier/@typescript-eslint',
  ],
  rules: {
    'prettier/prettier': 'error',
    // todo remove this when upgrading airbnb-typescript
    '@typescript-eslint/camelcase': 'off',
    // todo remove this when upgrading airbnb-typescript
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        format: ['camelCase'],
      },
      {
        selector: 'variable',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
      },
      {
        selector: 'enumMember',
        format: ['UPPER_CASE'],
      },
      {
        selector: 'parameter',
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: 'parameterProperty',
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: 'property',
        format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
      },
      {
        selector: 'function',
        format: ['camelCase', 'PascalCase'],
      },
      {
        selector: 'typeLike',
        format: ['PascalCase'],
      },
    ],
    // airbnb default is 1
    'max-classes-per-file': ['error', 5],
    // never allow default export
    'import/prefer-default-export': 'off',
    // never allow default export
    'import/no-default-export': 'error',
    // added by airbnb not-practical for entity-relation definitions
    'import/no-cycle': 'off',
    // needed so we can use class scoped generics in methods.
    'class-methods-use-this': 'off',
    // airbnb default this doesnt work when using parameter decorators.
    '@typescript-eslint/no-useless-constructor': 'off'
  },
  ignorePatterns: ['**/dist', '**/node_modules'],
  overrides: [
    {
      files: ['*.spec.ts'],
      rules: {
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],
};
