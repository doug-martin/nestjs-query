// jest.config.js
module.exports = {
  displayName: 'Unit',
  preset: 'ts-jest',
  collectCoverageFrom: ['packages/**/*.ts', '!**/__tests__/**', '!**/dist/**', '!**/node_modules/**'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@ptc-org/nestjs-query-core$': '<rootDir>/packages/core/src',
    '^@ptc-org/nestjs-query-graphql$': '<rootDir>/packages/query-graphql/src',
    '^@ptc-org/nestjs-query-typeorm': '<rootDir>/packages/query-typeorm/src'
  },
  setupFilesAfterEnv: ['jest-extended'],
  snapshotSerializers: ['jest-snapshot-serializer-raw/always']
};
