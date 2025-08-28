module.exports = {
    extends: [
        'react-app',
        'react-app/jest'
    ],
    rules: {
        // Disable warnings that cause build failures in CI
        '@typescript-eslint/no-unused-vars': 'warn',
        'react-hooks/exhaustive-deps': 'warn',
        // Disable console warnings completely for deployment
        'no-console': 'off'
    },
    env: {
        browser: true,
        es6: true,
        node: true
    }
};
