const nxPreset = require('@nrwl/jest/preset');

module.exports = {
  ...nxPreset,

  collectCoverage: true,
  coverageReporters: ['html', 'clover'],
  collectCoverageFrom: ['packages/**/*.ts', '!**/__tests__/**', '!**/dist/**', '!**/node_modules/**'],
  moduleNameMapper: {
    '@ptc-org/nestjs-query-core': '<rootDir>/packages/core/src',
    '@ptc-org/nestjs-query-graphql': '<rootDir>/packages/query-graphql/src',
    '@ptc-org/nestjs-query-typeorm': '<rootDir>/packages/query-typeorm/src',
    '@ptc-org/nestjs-query-sequelize': '<rootDir>/packages/query-sequelize/src',
    '@ptc-org/nestjs-query-typegoose': '<rootDir>/packages/query-typegoose/src',
    '@ptc-org/nestjs-query-mongoose': '<rootDir>/packages/query-mongoose/src',
  },
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended'],
  snapshotSerializers: ['jest-snapshot-serializer-raw/always']
};
