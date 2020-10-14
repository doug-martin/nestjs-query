module.exports = {
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
