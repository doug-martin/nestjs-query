module.exports = {
  rules: {
    'jest/expect-expect': [
      'error',
      {
        assertFunctionNames: [
          'expect',
          'expectSQLSnapshot',
          'expectSelectSQLSnapshot',
          'expectDeleteSQLSnapshot',
          'expectUpdateSQLSnapshot',
          'expectSoftDeleteSQLSnapshot',
        ],
      },
    ],
  },
};
