// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');
const js = require('@eslint/js');
const reactRefresh = require('eslint-plugin-react-refresh').default;
const globals = require('globals');

module.exports = defineConfig([
    expoConfig,
    {
        ignores: [
            'dist/**',
            'web-build/**',
            '.expo/**',
            'package-lock.json',
            '*.config.js',
            '*.config.ts',
            'build',
            '.coverage/',
            '.env',
            '.env.local',
            '.env.example',
        ],
    },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 'latest',
            globals: {
                ...globals.es2020,
                ...globals.browser,
                __DEV__: 'readonly',
            },
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        plugins: { 'react-refresh': reactRefresh },
        rules: {
            ...js.configs.recommended.rules,

            'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
            'react-refresh/only-export-components': [
                'warn',
                { allowConstantExport: true },
            ],
            camelcase: [
                'error',
                {
                    properties: 'always',
                    ignoreDestructuring: true,
                    ignoreImports: true,
                },
            ],
            'no-console': ['error', { allow: ['warn', 'error'] }],
            'no-debugger': 'error',
            'no-inline-comments': 'error',
            'no-warning-comments': [
                'error',
                { terms: ['todo', 'fixme'], location: 'anywhere' },
            ],

            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
        },
    },
    eslintPluginPrettierRecommended,
]);

