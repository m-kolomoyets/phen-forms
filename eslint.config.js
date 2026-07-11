import eslint from '@eslint/js';
import eslintPluginTanstackQuery from '@tanstack/eslint-plugin-query';
import eslintPluginTanstackRouter from '@tanstack/eslint-plugin-router';
import eslintPluginJSXA11y from 'eslint-plugin-jsx-a11y';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginReact from 'eslint-plugin-react';
import eslintPluginReactHooks from 'eslint-plugin-react-hooks';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
    globalIgnores([
        '**/node_modules/**',
        '**/dist/**',
        '**/tmp/**',
        '/src/routeTree.gen.ts',
        '/public/mockServiceWorker.js',
    ]),
    {
        files: ['**/*.{js,ts,tsx,cjs,mjs}'],
        extends: [
            eslint.configs.recommended,
            tseslint.configs.recommended,
            eslintPluginPrettierRecommended,
            eslintPluginReactHooks.configs.flat.recommended,
            eslintPluginReact.configs.flat.recommended,
            eslintPluginJSXA11y.flatConfigs.recommended,
            eslintPluginTanstackRouter.configs['flat/recommended'],
            eslintPluginTanstackQuery.configs['flat/recommended-strict'],
        ],
        languageOptions: {
            ecmaVersion: 2022,
            globals: globals.browser,
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
        rules: {
            'no-restricted-syntax': [
                'error',
                {
                    selector: 'CallExpression[callee.name="useEffect"] > ArrowFunctionExpression',
                    message: 'Use a named function for useEffect callbacks for better debugging and readability.',
                },
                {
                    selector:
                        'CallExpression[callee.object.name="React"][callee.property.name="useEffect"] > ArrowFunctionExpression',
                    message: 'Use a named function for useEffect callbacks for better debugging and readability.',
                },
                {
                    selector: 'CallExpression[callee.name="useLayoutEffect"] > ArrowFunctionExpression',
                    message:
                        'Use a named function for useLayoutEffect callbacks for better debugging and readability .',
                },
                {
                    selector:
                        'CallExpression[callee.object.name="React"][callee.property.name="useLayoutEffect"] > ArrowFunctionExpression',
                    message:
                        'Use a named function for useLayoutEffect callbacks for better debugging and readability .',
                },
                {
                    selector: 'CallExpression[callee.name="useImperativeHandle"] > ArrowFunctionExpression',
                    message:
                        'Use a named function for useImperativeHandle callbacks for better debugging and readability.',
                },
                {
                    selector:
                        'CallExpression[callee.object.name="React"][callee.property.name="useImperativeHandle"] > ArrowFunctionExpression',
                    message:
                        'Use a named function for useImperativeHandle callbacks for better debugging and readability.',
                },
                {
                    selector: 'CallExpression[callee.name="forwardRef"]',
                    message:
                        'forwardRef is deprecated in React 19 (https://react.dev/reference/react/forwardRef). Pass ref as a regular prop instead.',
                },
                {
                    selector: 'CallExpression[callee.object.name="React"][callee.property.name="forwardRef"]',
                    message:
                        'forwardRef is deprecated in React 19 (https://react.dev/reference/react/forwardRef). Pass ref as a regular prop instead.',
                },
            ],
            'react/react-in-jsx-scope': ['off'],
            'react/prop-types': ['off'],
            'react/function-component-definition': [
                2,
                { namedComponents: 'function-declaration', unnamedComponents: 'function-expression' },
            ],
            'react/jsx-no-useless-fragment': ['error'],
            'react/self-closing-comp': [
                'error',
                {
                    component: true,
                    html: true,
                },
            ],
            'react/no-children-prop': [
                'error',
                {
                    allowFunctions: true,
                },
            ],
            'jsx-a11y/label-has-associated-control': [
                2,
                {
                    labelComponents: ['Label', 'FieldLabel'],
                    labelAttributes: ['label'],
                    controlComponents: ['Input', 'PasswordInput'],
                    depth: 3,
                },
            ],
            '@tanstack/router/create-route-property-order': 'warn',
            '@typescript-eslint/no-empty-function': 'off',
            '@typescript-eslint/no-non-null-assertion': 'off',
            '@typescript-eslint/consistent-type-imports': 'error',
            '@typescript-eslint/no-import-type-side-effects': 'error',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    args: 'all',
                    argsIgnorePattern: '^_',
                    caughtErrors: 'all',
                    caughtErrorsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            '@typescript-eslint/no-unused-expressions': ['error', { allowShortCircuit: true, allowTernary: true }],
            'arrow-body-style': ['error', 'always'],
            'no-nested-ternary': ['error'],
            eqeqeq: ['error', 'always'],
            'no-alert': ['error'],
            'no-unneeded-ternary': ['error'],
            'require-await': ['error'],
            'no-tabs': ['error'],
            'max-len': [
                'error',
                {
                    code: 120,
                    ignoreUrls: true,
                    ignoreRegExpLiterals: true,
                    ignoreStrings: true,
                    ignoreTemplateLiterals: true,
                },
            ],
            quotes: ['error', 'single', { allowTemplateLiterals: true }],
            semi: ['error', 'always'],
            'no-loop-func': ['error'],
            'comma-style': ['error', 'last'],
            'space-before-blocks': ['error', 'always'],
            'no-mixed-spaces-and-tabs': ['error'],
            'no-unused-vars': 'off',
            'no-unused-expressions': 'off',
            'no-extra-semi': ['error'],
            'no-console': ['warn'],
            'no-debugger': ['error'],
            'block-spacing': ['error', 'always'],
            'max-nested-callbacks': [
                'error',
                {
                    max: 7,
                },
            ],
            'no-trailing-spaces': ['error'],
            'semi-spacing': [
                'error',
                {
                    before: false,
                    after: true,
                },
            ],
            'no-var': ['error'],
            'no-multi-spaces': ['error'],
            'no-control-regex': ['off'],
        },
    },
]);
