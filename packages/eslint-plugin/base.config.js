module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: { sourceType: 'module' },
  plugins: ['@typescript-eslint', '@spinnaker/eslint-plugin'],
  extends: ['eslint:recommended', 'prettier', 'prettier/@typescript-eslint', 'plugin:@typescript-eslint/recommended'],
  rules: {
    '@spinnaker/ng-no-component-class': 2,
    '@spinnaker/ng-no-module-export': 2,
    '@spinnaker/ng-no-require-angularjs': 2,
    '@spinnaker/ng-no-require-module-deps': 2,
    '@spinnaker/ng-strictdi': 2,
    indent: 'off',
    'member-ordering': 'off',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'no-extra-boolean-cast': 'off',
    'no-prototype-builtins': 'off',
    'one-var': ['error', { initialized: 'never' }],
    'prefer-rest-params': 'off',
    'prefer-spread': 'off',
    '@typescript-eslint/array-type': ['error', { default: 'array-simple' }],
    '@typescript-eslint/ban-ts-ignore': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-member-accessibility': 'off',
    '@typescript-eslint/indent': 'off',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/no-case-declarations': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-object-literal-type-assertion': 'off',
    '@typescript-eslint/no-parameter-properties': 'off',
    '@typescript-eslint/no-this-alias': 'off',
    '@typescript-eslint/no-triple-slash-reference': 'off',
    '@typescript-eslint/no-unused-vars': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-var-requires': 'off', // TODO: turn on once all code is using ES6 imports
    '@typescript-eslint/triple-slash-reference': 'off',
  },
  overrides: [
    {
      files: ['*.js', '*.jsx'],
      rules: {
        '@typescript-eslint/no-use-before-define': 'off',
      },
    },
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        'no-undef': 'off', // typescript already checks this
      },
    },
  ],
  env: {
    browser: true,
    node: true,
    es6: true,
    jasmine: true,
  },
  globals: {
    angular: true,
    $: true,
    _: true,
  },
};
