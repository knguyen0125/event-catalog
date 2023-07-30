/** @type {import('eslint').Linter.Config} */
export default {
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      extends: [
        // "@remix-run/eslint-config", "@remix-run/eslint-config/node",
        'airbnb',
        'airbnb-typescript',
        'prettier'
      ],
      parserOptions: {
        project: './tsconfig.json',
      },
      rules: {
        'import/extensions': 'off',
        'react/react-in-jsx-scope': 'off',
        'react/require-default-props': 'off',
        'react/function-component-definition': [2, { namedComponents: 'arrow-function' }],
      },
    },
  ],
};
