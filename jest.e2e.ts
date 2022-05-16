module.exports = {
  displayName: 'examples',
  preset: './jest.preset.ts',
  globals: {
    'ts-jest': {
      tsconfig: './examples/tsconfig.spec.json'
    }
  },
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  testMatch: ['**/e2e/**/*.spec.ts'],

  setupFilesAfterEnv: ['jest-extended'],
  snapshotSerializers: ['jest-snapshot-serializer-raw/always'],

  coverageDirectory: '../coverage/examples'
};
