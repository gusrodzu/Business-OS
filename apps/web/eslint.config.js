import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {ignores: ['dist']},
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: {jsx: true},
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // ESLint 10 + React Hooks 7 adds React Compiler diagnostics. Keep them
      // enabled as warnings until existing components can be refactored safely;
      // core Rules of Hooks and all other recommended errors remain enforced.
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/preserve-manual-memoization': 'warn',
      'react-hooks/purity': 'warn',
      // React JSX components are references; core no-unused-vars does not parse JSX usage.
      'no-unused-vars': ['error', {varsIgnorePattern: '^[A-Z]', argsIgnorePattern: '^(_|[A-Z])'}],
      'react-refresh/only-export-components': ['warn', {allowConstantExport: true}],
    },
  },
];
