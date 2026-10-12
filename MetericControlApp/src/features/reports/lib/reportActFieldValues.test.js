import assert from 'node:assert/strict';
import test from 'node:test';
import { registerHooks } from 'node:module';
import { REPORT_ACT_FIELDS } from '../constants/reportActFields.js';
import { reportSubmitFormDefaultValues } from '../constants/reportSubmitFormDefaults.js';
import {
    buildReportActFieldsPayload,
    hydrateReportActFields,
    parseReportDate,
    parseReportDateTime,
    formatReportDateTime,
} from './reportActFieldValues.js';

const loader = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === '@/features/reports/constants/reportPhotoConfigs')
            return {
                url: new URL(
                    '../constants/reportPhotoConfigs.js',
                    import.meta.url
                ).href,
                shortCircuit: true,
            };
        return nextResolve(specifier, context);
    },
});
const { reportSubmitFormSchema } =
    await import('../model/reportSubmitFormSchema.js');
loader.deregister();
const validValues = () => ({
    ...structuredClone(reportSubmitFormDefaultValues),
    customerName: 'Иванов Иван',
    personalAccount: '123456',
    metering: {
        ...reportSubmitFormDefaultValues.metering,
        newMeterType: 'Меркурий',
        newMeterNumber: '123',
        installationReading: '0',
    },
    admission: {
        ...reportSubmitFormDefaultValues.admission,
        status: 'ADMITTED',
    },
    consumerContact: {
        ...reportSubmitFormDefaultValues.consumerContact,
        isRefusedContact: true,
    },
    actPdf: { isRefused: true },
});

test('absent old meter, readings and seals are accepted without invented zeros', () => {
    const result = reportSubmitFormSchema.safeParse(validValues());
    assert.equal(result.success, true, JSON.stringify(result.error));
    const payload = buildReportActFieldsPayload(result.data);
    assert.equal(payload.metering.old_t1, null);
    assert.equal(payload.admission.is_compliant, null);
});

test('optional fields survive validation with zeros, decimal commas, dates and explicit no', () => {
    const input = validValues();
    input.meterBefore.digitsAfter = '0';
    input.meterBefore.verificationDate = '29.02.2024';
    input.metering.oldT1 = '0';
    input.metering.newT2 = '12,345';
    input.admission.isCompliant = false;
    input.actDetails.compiledAt = '12.10.2026 14:25';
    input.actDetails.representativeName = 'Иванов Иван';
    const validated = reportSubmitFormSchema.parse(input);
    const payload = buildReportActFieldsPayload(validated);
    assert.equal(payload.metering.old_digits_after, 0);
    assert.equal(payload.metering.old_verification_date, '2024-02-29');
    assert.equal(payload.metering.old_t1, '0');
    assert.equal(payload.metering.new_t2, '12.345');
    assert.equal(payload.admission.is_compliant, false);
    assert.equal(payload.act_details.representative_name, 'Иванов Иван');
    assert.equal(
        formatReportDateTime(payload.act_details.compiled_at),
        input.actDetails.compiledAt
    );
    const restored = hydrateReportActFields(payload);
    assert.equal(restored.meterBefore.digitsAfter, '0');
    assert.equal(restored.meterBefore.verificationDate, '29.02.2024');
    assert.equal(restored.admission.isCompliant, false);
});

test('invalid optional values point to the concrete field', () => {
    for (const [group, name, value] of [
        ['meterBefore', 'verificationDate', '31.02.2026'],
        ['metering', 'newT1', '1.1234'],
        ['meterBefore', 'digitsBefore', '2.5'],
        ['actDetails', 'compiledAt', '12.10.2026 25:00'],
        ['metering', 'replacementReason', 'INVALID'],
    ]) {
        const input = validValues();
        input[group][name] = value;
        const result = reportSubmitFormSchema.safeParse(input);
        assert.equal(result.success, false);
        assert.ok(
            result.error.issues.some(
                (issue) => issue.path.join('.') === `${group}.${name}`
            )
        );
    }
});

test('saving report fields leaves server signature values outside the update', () => {
    const input = validValues();
    input.actDetails.memberSignature = '';
    input.actDetails.consumerSignature = '';
    const payload = buildReportActFieldsPayload(
        reportSubmitFormSchema.parse(input)
    );
    assert.equal(Object.hasOwn(payload.act_details, 'member_signature'), false);
    assert.equal(
        Object.hasOwn(payload.act_details, 'consumer_signature'),
        false
    );
});

test('date parsing rejects impossible calendar dates and keeps local act time', () => {
    assert.equal(parseReportDate('29.02.2025'), null);
    assert.equal(parseReportDate('31.04.2026'), null);
    assert.equal(parseReportDate('29.02.2024'), '2024-02-29');
    assert.equal(parseReportDateTime('12.10.2026 23:60'), null);
    assert.equal(
        formatReportDateTime(parseReportDateTime('12.10.2026 09:07')),
        '12.10.2026 09:07'
    );
});

test('every new field can be saved and restored using its API type', () => {
    const input = validValues();
    for (const field of REPORT_ACT_FIELDS)
        input[field.group][field.name] =
            field.kind === 'boolean'
                ? false
                : field.kind === 'date'
                  ? '12.10.2026'
                  : field.kind === 'datetime'
                    ? '12.10.2026 09:07'
                    : field.kind === 'choice'
                      ? field.options[0].value
                      : ['integer', 'reading'].includes(field.kind)
                        ? '0'
                        : 'Тест';
    const payload = buildReportActFieldsPayload(
        reportSubmitFormSchema.parse(input)
    );
    const restored = hydrateReportActFields(payload);
    for (const field of REPORT_ACT_FIELDS)
        assert.equal(
            restored[field.group][field.name],
            input[field.group][field.name],
            `${field.group}.${field.name}`
        );
});

test('contact fields are optional and validate international phones, email length and each name part', () => {
    const input = validValues();
    input.consumerContact = {};
    assert.equal(reportSubmitFormSchema.safeParse(input).success, true);
    input.consumerContact = { phoneNumber: null, email: null };
    assert.equal(reportSubmitFormSchema.safeParse(input).success, true);
    for (const [field, value] of [
        ['phoneNumber', '89211234567'],
        ['phoneNumber2', '+123'],
        ['email', `${'a'.repeat(243)}@example.com`],
        ['fullName', `${'a'.repeat(41)} Иван Петрович`],
        ['isRefusedContact', null],
    ]) {
        input.consumerContact = { [field]: value };
        const result = reportSubmitFormSchema.safeParse(input);
        assert.equal(result.success, false, field);
        assert.ok(
            result.error.issues.some(
                (issue) => issue.path.join('.') === `consumerContact.${field}`
            )
        );
    }
    input.consumerContact = {
        phoneNumber: '+7 (921) 123-45-67',
        email: `${'a'.repeat(242)}@example.com`,
        fullName: `${'Я'.repeat(40)} Иван Петрович Оглы`,
    };
    assert.equal(reportSubmitFormSchema.safeParse(input).success, true);
});
