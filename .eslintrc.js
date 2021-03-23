module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },

  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    project:  ['./packages/*/tsconfig.json', './examples/tsconfig.json'],
    tsconfigRootDir: __dirname,

  },
  plugins: ['@typescript-eslint', 'prettier', 'import', 'jest', 'eslint-plugin-tsdoc'],
  extends: [
    'airbnb-typescript/base',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    "plugin:prettier/recommended"
  ],
  rules: {
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
    '@typescript-eslint/no-useless-constructor': 'off',

    // override airbnb to allow class interface merging
    "@typescript-eslint/no-redeclare": ["error", {ignoreDeclarationMerge: true}]

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
