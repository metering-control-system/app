import assert from 'node:assert/strict';
import test from 'node:test';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/features/auth/validation/loginSchema';

const validate = zodResolver(loginSchema);
const resolve = (values) =>
    validate(values, undefined, { shouldUseNativeValidation: false });

test('lets short credentials reach authentication without password strength rules', async () => {
    for (const password of ['1', 'abc', 'пароль', 'a#.-()']) {
        const values = { login: 'a', password };
        const result = await resolve(values);
        assert.deepEqual(result.errors, {});
        assert.deepEqual(result.values, values);
    }
});

test('preserves the exact password while trimming only the login', async () => {
    const password = '  password with spaces  ';
    const result = await resolve({ login: '  technician  ', password });
    assert.deepEqual(result.errors, {});
    assert.deepEqual(result.values, { login: 'technician', password });
});

test('allows a long login with standard username punctuation', async () => {
    const values = {
        login: 'installer.test+dev@example.ru',
        password: 'password',
    };
    const result = await resolve(values);
    assert.deepEqual(result.errors, {});
    assert.deepEqual(result.values, values);
});

test('shows required field errors instead of sending empty credentials', async () => {
    const result = await resolve({ login: '   ', password: '' });
    assert.deepEqual(result.values, {});
    assert.equal(result.errors.login.message, 'Введите логин');
    assert.equal(result.errors.password.message, 'Введите пароль');
});
