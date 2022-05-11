const nxPreset = require('@nrwl/jest/preset');

module.exports = {
  ...nxPreset,

  collectCoverage: true,
  coverageReporters: ['html', 'clover'],
  collectCoverageFrom: [
    '!**/node_modules/**',
    'src/**',
    '!**/__snapshots__/**',
    '!**/*.test.js',
    '!**/index.ts',
    '!**/*.json'
  ],

  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-extended'],
  snapshotSerializers: ['jest-snapshot-serializer-raw/always'],
  testTimeout: 20000
};
