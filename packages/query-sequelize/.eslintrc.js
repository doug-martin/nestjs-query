module.exports = {
  parserOptions: {
    project: "./tsconfig.build.json"
  },
  rules: {
    "jest/expect-expect": [
      "error",
      {
        assertFunctionNames: [
          "expect",
          "assertSQL",
          "assertFindOptions",
          "assertUpdateOptions",
          'assertDestroyOptions'
        ]
      }
    ]
  }
};
