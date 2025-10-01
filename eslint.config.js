const js = require('@eslint/js');
const globals = require('globals');
const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const react = require('eslint-plugin-react');
const reactHooks = require('eslint-plugin-react-hooks');
const reactNative = require('eslint-plugin-react-native');
const prettier = require('eslint-plugin-prettier');
const simpleImportSort = require('eslint-plugin-simple-import-sort');

module.exports = [
  { ignores: ['node_modules', 'android', 'ios', 'dist', 'build', 'coverage'] },
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react,
      'react-hooks': reactHooks,
      'react-native': reactNative,
      prettier,
      'simple-import-sort': simpleImportSort
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react/react-in-jsx-scope': 'off',
      'react-native/no-inline-styles': 'off',
      'react-native/no-raw-text': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',
      'prettier/prettier': 'warn',
      'no-empty': ['warn', { allowEmptyCatch: true }]
    }
  }
];
