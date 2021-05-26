module.exports = {
  rules: {
    'jest/expect-expect': [
      'error',
      {
        assertFunctionNames: [
          'expect',
          'expectFilterQuery',
          'expectEqualCreate'
        ],
      },
    ],
  },
};
