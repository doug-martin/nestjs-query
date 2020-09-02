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
          'assertSQL',
          'assertOneToManySQL',
          'assertManyToOneSQL',
          'assertManyToManyOwnerSQL',
          'assertManyToManyNonOwnerSQL',
          'assertManyToManyCustomJoinSQL',
          'assertOneToOneNonOwnerSQL',
          'assertOneToOneOwnerSQL',
          'assertSelectSQL',
          'assertUpdateSQL',
          'assertDeleteSQL',
          'assertSoftDeleteSQL',
          'assertManyToOneUniDirectionalSQL',
          'assertManyToManyUniDirectionalSQL'
        ],
      },
    ],
  },
};
