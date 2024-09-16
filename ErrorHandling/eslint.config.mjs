import parser from '@typescript-eslint/parser'
import eslintPlugin from '@typescript-eslint/eslint-plugin'
import prettierPlugin from 'eslint-plugin-prettier'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'
import eslintConfigPrettier from 'eslint-config-prettier'

// Sử dụng FlatCompat để hỗ trợ các cấu hình ESLint cũ
const compat = new FlatCompat({
  recommendedConfig: 'plugin:@typescript-eslint/recommended'
})

export default [
  js.configs.recommended,
  eslintConfigPrettier,
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: { parser },
    plugins: {
      '@typescript-eslint': eslintPlugin,
      prettier: prettierPlugin
    },
    ignores: ['node_modules/', 'dist/'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      'prettier/prettier': [
        'warn',
        {
          arrowParens: 'always',
          semi: false,
          trailingComma: 'none',
          tabWidth: 2,
          endOfLine: 'auto',
          useTabs: false,
          singleQuote: true,
          printWidth: 120,
          jsxSingleQuote: true
        }
      ]
    }
  }
]
