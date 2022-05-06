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
  ]
};
