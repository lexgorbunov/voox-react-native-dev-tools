module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    // 'plugin:prettier/recommended',
    '@react-native-community',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: [
    '@typescript-eslint',
    'import',
    'simple-import-sort',
    'prettier',
    'react',
    'react-native',
    'react-hooks',
  ],
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
  },
  rules: {
    'no-use-before-define': 'off',
    'react-hooks/exhaustive-deps': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    'prettier/prettier': [
      'error',
      {
        bracketSpacing: false,
        jsxBracketSameLine: true,
        singleQuote: true,
        trailingComma: 'all',
        tabWidth: 2,
        useTabs: false,
        semi: false,
        printWidth: 80,
        jsxSingleQuote: true,
        endOfLine: 'auto',
      },
    ],
  },
  globals: {
    JSX: true,
  },
};
