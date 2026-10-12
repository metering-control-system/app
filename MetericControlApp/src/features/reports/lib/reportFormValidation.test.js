import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import test from 'node:test';
import { zodResolver } from '@hookform/resolvers/zod';
import { getFirstReportValidationError } from './reportFormValidation.js';

const loader = registerHooks({
    resolve(specifier, context, nextResolve) {
        if (specifier === '@/features/reports/constants/reportPhotoConfigs') {
            return {
                url: new URL(
                    '../constants/reportPhotoConfigs.js',
                    import.meta.url
                ).href,
                shortCircuit: true,
            };
        }
        return nextResolve(specifier, context);
    },
});
const { reportSubmitFormSchema } =
    await import('../model/reportSubmitFormSchema.js');
loader.deregister();
const validate = zodResolver(reportSubmitFormSchema);
const values = () => ({
    customerName: 'Иванов Иван Иванович',
    personalAccount: '123456',
    comment: '',
    meterBefore: {
        type: 'Старый ПУ',
        number: '100',
        isActualDifferent: false,
        actualType: '',
        actualNumber: '',
    },
    metering: {
        dismantlingCompleted: true,
        oldReading: '100',
        newMeterType: 'Новый ПУ',
        newMeterNumber: '200',
        sealLocation: 'CIRCUIT_BREAKER',
        sealNumber: '300',
        installationReading: '0',
    },
    photos: {},
    admission: {
        status: 'ADMITTED',
        rejectionReason: '',
        rejectionComment: '',
    },
    consumerContact: {
        isRefusedContact: true,
        phoneNumber: '',
        phoneNumber2: '',
        email: '',
        fullName: '',
    },
    actPdf: { isRefused: true, uri: '', id: '' },
});
const firstError = async (input) => {
    const result = await validate(
        input,
        {},
        { criteriaMode: 'firstError', shouldUseNativeValidation: false }
    );
    return getFirstReportValidationError(result.errors);
};

test('saving from the act step points to a missing meter field on the earlier step', async () => {
    const input = values();
    input.metering.newMeterNumber = '';
    assert.deepEqual(await firstError(input), {
        stepIndex: 1,
        field: 'metering.newMeterNumber',
        message: 'Введите номер нового ПУ',
    });
});

test('missing admission selection opens the admission step with its concrete error', async () => {
    const input = values();
    input.admission.status = '';
    assert.deepEqual(await firstError(input), {
        stepIndex: 3,
        field: 'admission.status',
        message: 'Выберите статус допуска',
    });
});

test('rejection reasons and contacts are optional as in the report API', async () => {
    const input = values();
    input.admission.status = 'NOT_ADMITTED';
    input.consumerContact.isRefusedContact = false;
    const result = await validate(
        input,
        {},
        { criteriaMode: 'firstError', shouldUseNativeValidation: false }
    );
    assert.deepEqual(result.errors, {});
});

test('the first invalid step follows form order rather than object key order', () => {
    const error = getFirstReportValidationError({
        consumerContact: { email: { message: 'Неверный email' } },
        meterBefore: { number: { message: 'Введите номер старого ПУ' } },
    });
    assert.deepEqual(error, {
        stepIndex: 0,
        field: 'meterBefore.number',
        message: 'Введите номер старого ПУ',
    });
});

test('a root error is still shown without inventing a field or step', () => {
    const ref = {};
    ref.current = ref;
    const error = getFirstReportValidationError({
        root: { message: 'Проверьте данные отчёта', ref },
    });
    assert.deepEqual(error, {
        stepIndex: null,
        field: null,
        message: 'Проверьте данные отчёта',
    });
});

test('valid zero readings and refused contacts do not produce validation errors', async () => {
    const input = values();
    input.metering.oldReading = '0';
    const result = await validate(
        input,
        {},
        { criteriaMode: 'firstError', shouldUseNativeValidation: false }
    );
    assert.deepEqual(result.errors, {});
});

test('invalid act date opens the report details step and identifies the field', async () => {
    const input = values();
    input.actDetails = { powerOfAttorneyDate: '31.02.2026' };
    assert.deepEqual(await firstError(input), {
        stepIndex: 5,
        field: 'actDetails.powerOfAttorneyDate',
        message: 'Введите существующую дату в формате ДД.ММ.ГГГГ',
    });
});

test('invalid tariff reading opens the meter step', async () => {
    const input = values();
    input.metering.newT1 = 'нет';
    assert.deepEqual(await firstError(input), {
        stepIndex: 1,
        field: 'metering.newT1',
        message: 'Введите показания: до 9 цифр до запятой и до 3 после',
    });
});
