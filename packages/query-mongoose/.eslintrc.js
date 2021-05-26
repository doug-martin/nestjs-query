module.exports = {
  rules: {
    'jest/expect-expect': [
      'error',
      {
        assertFunctionNames: [
          'expect',
          'expectFilter',
          'expectEqualEntities',
          'expectEqualCreate'
        ],
      },
    ],
  },
};
