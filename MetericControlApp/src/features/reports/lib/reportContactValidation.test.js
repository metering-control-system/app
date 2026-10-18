import assert from 'node:assert/strict';
import test from 'node:test';
import {
    isValidReportEmail,
    isValidReportPhone,
    normalizeReportPhone,
} from '@/features/reports/lib/reportContactValidation';

test('phones require a valid international number and normalize punctuation to E.164', () => {
    for (const value of [
        '',
        '+79211234567',
        '+7 (921) 123-45-67',
        '+1 202-555-0123',
        '+44 20 7946 0018',
    ])
        assert.equal(isValidReportPhone(value), true, value);
    for (const value of [
        '89211234567',
        '9211234567',
        '+123',
        '+7 921 123',
        '+7 (000) 123-45-67',
        'call +79211234567',
    ])
        assert.equal(isValidReportPhone(value), false, value);
    assert.equal(normalizeReportPhone('+7 (921) 123-45-67'), '+79211234567');
    assert.equal(normalizeReportPhone('+1 202-555-0123'), '+12025550123');
    assert.equal(normalizeReportPhone(null), '');
});

test('emails allow API-supported domains and quoted names without accepting malformed addresses', () => {
    for (const value of [
        '',
        'user@example.com',
        'a+b@example.com',
        'user@пример.рф',
        'user@localhost',
        '"a@b"@example.com',
        'user@[127.0.0.1]',
        'user@[::1]',
    ])
        assert.equal(isValidReportEmail(value), true, value);
    for (const value of [
        'a',
        '@example.com',
        'a..b@example.com',
        'a@example',
        'a@-example.com',
        'a@example-.com',
        'a b@example.com',
        'a@[999.0.0.1]',
        'a@example.com\n',
    ])
        assert.equal(isValidReportEmail(value), false, value);
});
