module.exports = {
  plugins: ['@typescript-eslint'],
  extends: [
    'next',
    'turbo',
    'prettier',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:react-hooks/recommended',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'react/jsx-key': 'off',
    'react/display-name': 'off',
    'react/react-in-jsx-scope': 'off',
  },
  parser: '@typescript-eslint/parser',
}
