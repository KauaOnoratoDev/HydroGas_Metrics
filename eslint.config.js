const typescriptEslintPlugin = require('@typescript-eslint/eslint-plugin')
const typescriptEslintParser = require('@typescript-eslint/parser')

module.exports = [
  {
    languageOptions: {
      parser: typescriptEslintParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module'
      },
      globals: {}
    },
    plugins: {
      '@typescript-eslint': typescriptEslintPlugin,
      prettier: require('eslint-plugin-prettier')
    },
    rules: {
      semi: 'off',
      quotes: 0,
      'no-console': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-trailing-spaces': 'error',
      indent: ['error', 2],
      'max-len': ['warn', { code: 80 }],
      'prefer-const': 'error',
      'prettier/prettier': ['error', { printWidth: 80 }]
    }
  }
]
