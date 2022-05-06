// jest.config.js
module.exports = {
  displayName: 'E2E',
  preset: './jest.preset.ts',
  testMatch: ['**/e2e/**/*.spec.ts'],
  collectCoverageFrom: ['packages/**/*.ts', '!**/__tests__/**', '!**/dist/**', '!**/node_modules/**'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended'],
  snapshotSerializers: ['jest-snapshot-serializer-raw/always']
};
