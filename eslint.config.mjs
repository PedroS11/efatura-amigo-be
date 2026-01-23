import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import simpleImportSort from "eslint-plugin-simple-import-sort";

export default tseslint.config(
  {
    ignores: ["node_modules/**", "cdk.out/**", "dist/**", "eslint.config.mjs"]
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        ecmaFeatures: {
          impliedStrict: true
        },
        project: "./tsconfig.json"
      },
      globals: {
        ...globals.node,
        ...globals.es2021
      }
    },
    plugins: {
      "unused-imports": unusedImports,
      "simple-import-sort": simpleImportSort
    },
    rules: {
      "no-console": 0,
      "no-prototype-builtins": 0,
      "no-case-declarations": 0,
      "no-empty-pattern": 0,
      camelcase: 1,
      "@typescript-eslint/no-unused-vars": 1,
      "@typescript-eslint/await-thenable": 1,
      "@typescript-eslint/no-explicit-any": 0,
      "@typescript-eslint/ban-ts-comment": 0,
      "@typescript-eslint/no-non-null-assertion": 0,
      "unused-imports/no-unused-imports": 2,
      "simple-import-sort/imports": 2,
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-empty-object-type": 0
    }
  }
);
