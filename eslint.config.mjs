import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default [
  {
    files: ["**/*.ts"],

    languageOptions: {
      ecmaVersion: 2024,
      parser: tsparser,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.es2024
      }
    },

    plugins: {
      "@typescript-eslint": tseslint,
      prettier: prettierPlugin,
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort
    },

    rules: {
      ...tseslint.configs.recommended.rules,
      ...prettierConfig.rules,
      "@typescript-eslint/no-unused-vars": "warn",
      "no-console": "warn",
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "prettier/prettier": "error",
      "unused-imports/no-unused-imports": 2,
      "simple-import-sort/imports": 2,
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-empty-object-type": 0
    }
  }
];
