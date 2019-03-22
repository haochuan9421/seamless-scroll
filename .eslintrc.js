module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    node: true
  },
  extends: "eslint:recommended",
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
    parser: "babel-eslint"
  },
  rules: {
    indent: ["error", 2, { SwitchCase: 1 }],
    quotes: ["error", "single"],
    semi: ["error", "always"],
    "no-console": "off",
    "comma-dangle": ["error", "never"],
    "eol-last": ["error", "always"]
  }
};
