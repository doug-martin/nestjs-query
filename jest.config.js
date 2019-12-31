// jest.config.js
module.exports = {
  // [...]
  // Replace `ts-jest` with the preset you want to use
  // from the above list
  preset: 'ts-jest',
  collectCoverageFrom: ['packages/**/*.ts', '!**/__tests__/**', '!**/dist/**', '!**/node_modules/**'],
  testMatch: ['**/__tests__/**/*.spec.ts'],
};
