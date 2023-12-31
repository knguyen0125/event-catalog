/** @type {import('eslint').Linter.Config} */
module.exports = {
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        // "@remix-run/eslint-config", "@remix-run/eslint-config/node",
        'airbnb',
        'airbnb-typescript',
        'plugin:prettier/recommended',
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        'import/extensions': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/require-default-props': 'off',
        'react/function-component-definition': [
          2,
          { namedComponents: 'arrow-function' },
        ],
        '@typescript-eslint/no-throw-literal': 'off',
      },
    },
    {
      files: ['*.js', '*.jsx'],
      extends: ['airbnb', 'plugin:prettier/recommended'],
    },
  ],
};
