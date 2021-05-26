// jest.config.js
module.exports = {
  displayName: 'Unit',
  preset: 'ts-jest',
  collectCoverageFrom: ['packages/**/*.ts', '!**/__tests__/**', '!**/dist/**', '!**/node_modules/**'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@nestjs-query/(.*)$': '<rootDir>/packages/$1/src',
  },
  snapshotSerializers: ['jest-snapshot-serializer-raw/always']
};
