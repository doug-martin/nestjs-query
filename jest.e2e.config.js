// jest.config.js
module.exports = {
  // [...]
  // Replace `ts-jest` with the preset you want to use
  // from the above list
  preset: 'ts-jest',
  testMatch: ['**/e2e/**/*.spec.ts'],
  collectCoverageFrom: ['packages/**/*.ts', '!**/__tests__/**', '!**/dist/**', '!**/node_modules/**'],
  moduleNameMapper: {
    '^@nestjs-query/(.*)$': '<rootDir>/packages/$1/src',
  },
};
