// ---------------------------------------------------------------------------
// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
// ---------------------------------------------------------------------------

module.exports = {
	parser: "@typescript-eslint/parser", // Specifies the ESLint parser
	parserOptions: {
	  ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
	  sourceType: "module", // Allows for the use of imports
	  ecmaFeatures: {
		jsx: true // Allows for the parsing of JSX
	  },
	  project: './tsconfig.json',
	},
	plugins: ["@typescript-eslint", "prettier"],
	settings: {
	  react: {
		version: "detect" // Tells eslint-plugin-react to automatically detect the version of React to use
	  }
	},
	extends: [
	  "eslint:recommended",
	  "plugin:react/recommended", // Uses the recommended rules from @eslint-plugin-react
	  "plugin:@typescript-eslint/recommended", // Uses the recommended rules from @typescript-eslint/eslint-plugin
	  "plugin:react-hooks/recommended",
	  "plugin:prettier/recommended"
	],
	rules: {
	  // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
	  // e.g. "@typescript-eslint/explicit-function-return-type": "off",
	  "react-hooks/rules-of-hooks": "error",
	  "react-hooks/exhaustive-deps": "warn",
	  "prefer-const": "warn",
	  "no-var": "error",
	  "@typescript-eslint/no-explicit-any": "warn",
	  "@typescript-eslint/no-unused-vars": "warn",
	  "@typescript-eslint/no-unsafe-return": "error",
	  "@typescript-eslint/no-extra-semi": "off",
	  "prettier/prettier": "error",
	  "no-duplicate-imports": ["error", { includeExports: true }],
	},
  };