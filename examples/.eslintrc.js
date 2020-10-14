module.exports = {
  rules: {
    'jest/expect-expect': ['error', { assertFunctionNames: ['expect', 'request.**.expect'] }],
  },
};
