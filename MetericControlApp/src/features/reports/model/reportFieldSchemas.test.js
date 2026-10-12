import assert from 'node:assert/strict';
import test from 'node:test';
import {
    reportReadingSchema,
    reportIntegerSchema,
    reportTextSchema,
    reportChoiceSchema,
} from './reportFieldSchemas.js';
import { REPORT_ACT_FIELDS } from '../constants/reportActFields.js';
import {
    parseReportDate,
    parseReportDateTime,
    buildReportActFieldsPayload,
} from '../lib/reportActFieldValues.js';
import { splitReportContactName } from '../lib/reportContactValues.js';

const reading = reportReadingSchema();
test('readings retain zero and signed decimals while enforcing API precision', () => {
    for (const value of [
        '0',
        0,
        '-1',
        '-999999999.999',
        '999999999.999',
        '12,345',
        '.125',
        '1.',
    ])
        assert.equal(reading.safeParse(value).success, true, String(value));
    for (const value of [
        '1000000000',
        '-1000000000',
        '1.1234',
        'NaN',
        'Infinity',
        Infinity,
        NaN,
        '1e3',
        false,
    ])
        assert.equal(reading.safeParse(value).success, false, String(value));
    for (const value of ['', null, undefined])
        assert.equal(reading.parse(value), '');
    for (const value of ['', null, undefined])
        assert.equal(
            reportReadingSchema('Введите показания').safeParse(value).success,
            false
        );
});

test('all tariff readings share the same limits and integer fields accept the full API range', () => {
    const fields = REPORT_ACT_FIELDS.filter(
        (field) => field.kind === 'reading'
    );
    assert.equal(fields.length, 4);
    for (const field of fields) {
        const values = {
            [field.group]: { [field.name]: reading.parse('-1,125') },
        };
        assert.equal(
            buildReportActFieldsPayload(values).metering[field.api],
            '-1.125'
        );
    }
    const integer = reportIntegerSchema();
    for (const value of ['0', 0, '32767', 32767, '', null])
        assert.equal(integer.safeParse(value).success, true);
    for (const value of ['-1', '1.5', '32768', 32768, 'Infinity', false])
        assert.equal(integer.safeParse(value).success, false);
});

test('text limits count Unicode characters and reject null bytes or broken surrogates', () => {
    const text = reportTextSchema(40, 'Слишком длинное значение');
    assert.equal(text.parse(` ${'Я'.repeat(40)} `), 'Я'.repeat(40));
    assert.equal(text.safeParse('Я'.repeat(41)).success, false);
    assert.equal(text.safeParse('😀'.repeat(40)).success, true);
    for (const value of ['a\u0000b', '\ud800', '\udfff', null])
        assert.equal(text.safeParse(value).success, false);
    assert.equal(reportTextSchema().safeParse('А'.repeat(10001)).success, true);
});

test('optional choices accept blank strings but reject nulls and foreign enum values', () => {
    const choice = reportChoiceSchema([
        { value: 'ADMITTED' },
        { value: 'NOT_ADMITTED' },
    ]);
    for (const value of ['', 'ADMITTED', 'NOT_ADMITTED'])
        assert.equal(choice.safeParse(value).success, true);
    for (const value of [null, 'Допущен', 'OTHER', false])
        assert.equal(choice.safeParse(value).success, false);
    assert.equal(
        reportChoiceSchema(
            [{ value: 'ADMITTED' }],
            'Выберите статус'
        ).safeParse('').success,
        false
    );
});

test('dates validate calendar existence without inventing year or date-order restrictions', () => {
    assert.equal(parseReportDate('01.01.0001'), '0001-01-01');
    assert.equal(parseReportDate('29.02.0004'), '0004-02-29');
    assert.equal(parseReportDate('29.02.1900'), null);
    assert.equal(parseReportDate('01.01.0000'), null);
    assert.equal(parseReportDate('31.12.9999'), '9999-12-31');
    assert.equal(parseReportDateTime('12.10.2026 24:00'), null);
});

test('contact splitting preserves compound patronymics instead of dropping words', () => {
    assert.deepEqual(
        splitReportContactName('  Иванов  Иван  Петрович  Оглы '),
        { lastName: 'Иванов', firstName: 'Иван', middleName: 'Петрович Оглы' }
    );
    assert.deepEqual(splitReportContactName(''), {
        lastName: '',
        firstName: '',
        middleName: '',
    });
});
