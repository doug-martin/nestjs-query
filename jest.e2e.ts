/* eslint-disable */
export default {
  displayName: 'examples',
  preset: './jest.preset.js',
  globals: {
    'ts-jest': {
      tsconfig: process.cwd() + '/examples/tsconfig.spec.json'
    }
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testMatch: ['**/examples/**/e2e/**/*.spec.ts'],
  setupFilesAfterEnv: ['jest-extended'],
  snapshotSerializers: ['jest-snapshot-serializer-raw/always'],
  coverageDirectory: './coverage/examples'
}
