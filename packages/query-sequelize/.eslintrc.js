module.exports = {
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
