module.exports = {
  parserOptions: {
    project: './tsconfig.build.json',
  },
  rules: {
    'jest/expect-expect': [
      'error',
      {
        assertFunctionNames: [
          'expect',
          'assertFilterQuery',
          'assertQuery',
          'expectEqualEntities',
          'expectEqualCreate'
        ],
      },
    ],
  },
};
