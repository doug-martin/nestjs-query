module.exports = {
  rules: {
    'jest/expect-expect': [
      'error',
      {
        assertFunctionNames: [
          'expect',
          'expectSDL',
          'expectResolverSDL',
          'assertLimitAndOffset',
          'assertQueryCall',
          'assertResolverMethodCall',
          'assertMutationCall'
        ],
      },
    ],
  },
};
