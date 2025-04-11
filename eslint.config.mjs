import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import nxEslintPlugin from '@nx/eslint-plugin';
import eslintPluginUnusedImports from 'eslint-plugin-unused-imports';

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    ignores: [
      '**/dist',
      '**/vite.config.*.timestamp*',
      '**/vitest.config.*.timestamp*',
    ],
  },
  {
    plugins: {
      '@nx': nxEslintPlugin,
      'unused-imports': eslintPluginUnusedImports,
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [],
          depConstraints: [
            {
              sourceTag: '*',
              onlyDependOnLibsWithTags: ['*'],
            },
          ],
        },
      ],
      semi: ['error', 'always'],
      quotes: ['error', 'double'],
      indent: ['error', 2],
      'unused-imports/no-unused-imports': 'error',
    },
  },
  ...compat
    .config({
      extends: ['plugin:@nx/typescript'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.ts', '**/*.tsx', '**/*.cts', '**/*.mts'],
      rules: {
        ...config.rules,
        semi: ['error', 'always'],
        quotes: ['error', 'double'],
        indent: ['error', 2],
        'unused-imports/no-unused-imports': 'error',
      },
    })),
  ...compat
    .config({
      extends: ['plugin:@nx/javascript'],
    })
    .map((config) => ({
      ...config,
      files: ['**/*.js', '**/*.jsx', '**/*.cjs', '**/*.mjs'],
      rules: {
        ...config.rules,
        semi: ['error', 'always'],
        quotes: ['error', 'double'],
        indent: ['error', 2],
        'unused-imports/no-unused-imports': 'error',
      },
    })),
  ...compat
    .config({
      env: {
        jest: true,
      },
    })
    .map((config) => ({
      ...config,
      files: ['**/*.spec.ts', '**/*.spec.tsx', '**/*.spec.js', '**/*.spec.jsx'],
      rules: {
        ...config.rules,
        semi: ['error', 'always'],
        quotes: ['error', 'double'],
        indent: ['error', 2],
        'unused-imports/no-unused-imports': 'error',
      },
    })),
];
