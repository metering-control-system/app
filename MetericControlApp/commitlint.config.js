module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            1,
            'always',
            ['feat', 'fix', 'style', 'chore', 'refactor'],
        ],
        'type-case': [2, 'always', 'lower-case'],
        'subject-empty': [2, 'never'],
    },
};