module.exports = {
  rules: {
    "jest/expect-expect": [
      "error",
      {
        assertFunctionNames: [
          'expect',
          'expectUpdateOptions',
          'expectDestroyOptions',
          'expectFindOptions',
          'expectWhereQuery',
          'expectAggregateQuery',
        ]
      }
    ]
  }
};
