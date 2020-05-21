// jest.config.js
module.exports = {
  projects: ['./jest.unit.config.js', './jest.e2e.config.js'],
  collectCoverageFrom: ['packages/**/*.ts', '!**/__tests__/**', '!**/dist/**', '!**/node_modules/**'],
};
