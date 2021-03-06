export default {
    env: {
        es6: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier",
        "prettier/@typescript-eslint",
        "plugin:prettier/recommended",
    ],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly",
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
    },
    plugins: ["@typescript-eslint", "prettier"],
    rules: {
        quotes: "off",
        "vars-on-top": "warn",
        "linebreak-style": "off",
        "@typescript-eslint/no-use-before-define": 0,
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/explicit-function-return-type": 0,
        "@typescript-eslint/explicit-module-boundary-types": 0,
    },
};
