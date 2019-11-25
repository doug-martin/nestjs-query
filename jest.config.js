/* eslint-disable */
const tsconfig = require('tsconfig-extends');
const { pathsToModuleNameMapper } = require('ts-jest/utils');

const compilerOptions = tsconfig.load_file_sync('./tsconfig.jest.json', __dirname);

module.exports = {
  preset: 'ts-jest',
  setupFilesAfterEnv: ['jest-extended'],
  moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, {
    prefix: '<rootDir>/packages/'
  }),
  // moduleFileExtensions: ['ts', 'js'],
  testRegex: '\\.spec.ts$',
  rootDir: '.',
  // transform: {
  //   '^.+\\.ts$': 'ts-jest'
  // },
  globals: {
    'ts-jest': {
      tsConfig: '<rootDir>/tsconfig.jest.json'
    }
  },
  coverageReporters: ['json', 'lcov', 'text-summary'],
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'packages/**/*.ts',
    '!packages/**/index.ts',
    '!**/dist/**',
    '!**/node_modules/**'
  ],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  }
};
