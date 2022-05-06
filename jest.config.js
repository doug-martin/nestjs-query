// jest.config.js
module.exports = {
  projects: [
    './jest.unit.config.js',
    './jest.e2e.config.js',
    '<rootDir>/packages/core',
    '<rootDir>/packages/query-graphql',
    '<rootDir>/packages/query-typeorm',
    '<rootDir>/examples'
  ],
  testTimeout: 10000,
  collectCoverageFrom: ['packages/**/*.ts', '!**/__tests__/**', '!**/dist/**', '!**/node_modules/**'],
  snapshotSerializers: ['jest-snapshot-serializer-raw/always']
};
