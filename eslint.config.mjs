// eslint.config.mjs
import js from "@eslint/js";
import nxPlugin from "@nx/eslint-plugin";
import unusedImports from "eslint-plugin-unused-imports";
import typescriptPlugin from "@typescript-eslint/eslint-plugin";
import nextPlugin from "@next/eslint-plugin-next";
import tsParser from "@typescript-eslint/parser";

// Falls nötig: import nextPlugin from "eslint-plugin-next";
// Falls nötig: import reactPlugin from "eslint-plugin-react";

export default [
  {
    ignores: [
      "**/.next/**/*",
      "**/dist/**/*",
      "**/storybook-static/**/*",
      "**/vite.config.*.timestamp*",
      "**/vitest.config.*.timestamp*",
    ],
  },

  // 1. Global / Standard-Regeln für alle Dateien
  {
    // keine `files` => gilt für alle Dateien standardmässig
    ...js.configs.recommended,
    plugins: {
      "@nx": nxPlugin,
      "unused-imports": unusedImports,
      "@typescript-eslint": typescriptPlugin,
      // react: reactPlugin,
    },
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: "scope:movies",
              onlyDependOnLibsWithTags: ["scope:movies", "scope:shared"],
            },
            {
              sourceTag: "scope:stocks",
              onlyDependOnLibsWithTags: ["scope:stocks", "scope:shared"],
            },
            {
              sourceTag: "scope:tools",
              onlyDependOnLibsWithTags: ["scope:movies", "scope:stocks", "scope:shared", "scope:tools"],
            },
            {
              sourceTag: "scope:shared",
              onlyDependOnLibsWithTags: ["scope:shared"],
            },
            {
              sourceTag: "type:app",
              onlyDependOnLibsWithTags: [
                "type:api",
                "type:data-access",
                "type:server",
                "type:shared",
                "type:types",
                "type:ui",
              ],
            },
            {
              sourceTag: "type:e2e",
              onlyDependOnLibsWithTags: ["type:app", "type:api", "type:data-access", "type:shared", "type:types"],
            },
            {
              sourceTag: "type:api",
              onlyDependOnLibsWithTags: ["type:data-access", "type:shared", "type:types"],
            },
            {
              sourceTag: "type:data-access",
              onlyDependOnLibsWithTags: ["type:shared", "type:types"],
            },
            {
              sourceTag: "type:server",
              onlyDependOnLibsWithTags: ["type:shared", "type:types"],
            },
            {
              sourceTag: "type:ui",
              onlyDependOnLibsWithTags: ["type:shared", "type:types", "type:ui"],
            },
            {
              sourceTag: "type:shared",
              onlyDependOnLibsWithTags: ["type:shared", "type:types"],
            },
            {
              sourceTag: "type:types",
              onlyDependOnLibsWithTags: ["type:types"],
            },
          ],
        },
      ],
      semi: ["error", "always"],
      quotes: ["error", "double"],
      indent: ["error", 2],
      "unused-imports/no-unused-imports": "warn",
      "no-restricted-syntax": [
        "warn",
        {
          selector:
            "JSXOpeningElement[name.name=/^(Input|Textarea)$/] JSXAttribute[name.name='onChange']",
          message:
            "HeroUI Input/Textarea must use onValueChange instead of onChange (composition bug).",
        },
      ],
    },
  },

  // 2. Regeln nur für TypeScript (.ts/.tsx)
  {
    files: ["**/*.ts", "**/*.tsx"],
    // Hier kannst du parserOptions oder languageOptions setzen, falls benötigt
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    rules: {
      // overrides speziell für .ts/.tsx falls gewünscht
    },
  },

  // 3. Regeln nur für JavaScript (.js/.jsx)
  {
    files: ["**/*.js", "**/*.jsx"],
    rules: {
      // overrides speziell für .js/.jsx falls gewünscht
    },
  },

  // 4. Regeln nur für Testdateien
  {
    files: ["**/*.spec.ts", "**/*.spec.tsx", "**/*.spec.js", "**/*.spec.jsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: {
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
      },
    },
    rules: {
      // Test-spezifische Regeln
    },
  },

  // 5. Spezielle Regel für dein Next.js UI App (z. B. pages-Verlinkung)
  {
    files: [
      "apps/movies-ui/**/*.ts",
      "apps/movies-ui/**/*.tsx",
      "apps/movies-ui/**/*.js",
      "apps/movies-ui/**/*.jsx",
    ],
    plugins:  {
      "@next/next": nextPlugin,
    },
    rules: {
      "@next/next/no-html-link-for-pages": [
        "error",
        "apps/movies-ui/pages",
      ],
    },
  },
];
