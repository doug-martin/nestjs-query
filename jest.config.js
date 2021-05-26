// jest.config.js
module.exports = {
  projects: ['./jest.unit.config.js', './jest.e2e.config.js'],
  testTimeout: 10000,
  collectCoverageFrom: ['packages/**/*.ts', '!**/__tests__/**', '!**/dist/**', '!**/node_modules/**'],
  snapshotSerializers: ['jest-snapshot-serializer-raw/always']
};
