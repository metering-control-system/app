import { z } from 'zod';
import { createReportPhotoSlotRecord } from '@/features/reports/constants/reportPhotoConfigs';
import { REPORT_ACT_FIELDS } from '../constants/reportActFields.js';
import {
    parseReportDate,
    parseReportDateTime,
} from '../lib/reportActFieldValues.js';

const optionalTrimmedString = (max, message) =>
    z.string().trim().max(max, message);

const requiredTrimmedString = (max, requiredMessage, maxMessage) =>
    z.string().trim().min(1, requiredMessage).max(max, maxMessage);

const meterReadingField = (label) =>
    z
        .string()
        .trim()
        .min(1, `Введите ${label}`)
        .regex(/^\d+([.,]\d{1,3})?$/, `${label} должны быть числом`);

const optionalPhoneField = z
    .string()
    .trim()
    .refine(
        (value) => !value || /^[+\d\s()-]{6,20}$/.test(value),
        'Введите корректный телефон'
    );

const optionalEmailField = z
    .string()
    .trim()
    .refine(
        (value) => !value || z.email().safeParse(value).success,
        'Введите корректный адрес электронной почты'
    );

const photoArrayField = z.array(z.string().trim()).default([]);
const reportPhotoFields = createReportPhotoSlotRecord(() => photoArrayField);

const actFieldsSchema = (group) =>
    Object.fromEntries(
        REPORT_ACT_FIELDS.filter((field) => field.group === group).map(
            (field) => {
                let schema = z.string().trim();
                if (field.kind === 'boolean')
                    return [field.name, z.boolean().nullable().default(null)];
                if (field.maxLength)
                    schema = schema.max(
                        field.maxLength,
                        `${field.label}: значение слишком длинное`
                    );
                if (field.kind === 'reading')
                    schema = schema.refine(
                        (value) =>
                            !value || /^\d{1,9}([.,]\d{1,3})?$/.test(value),
                        'Введите показания: до 9 цифр до запятой и до 3 после'
                    );
                if (field.kind === 'integer')
                    schema = schema.refine(
                        (value) =>
                            !value ||
                            (/^\d+$/.test(value) && Number(value) <= 32767),
                        'Введите целое число от 0 до 32767'
                    );
                if (field.kind === 'date')
                    schema = schema.refine(
                        (value) => !value || parseReportDate(value),
                        'Введите существующую дату в формате ДД.ММ.ГГГГ'
                    );
                if (field.kind === 'datetime')
                    schema = schema.refine(
                        (value) => !value || parseReportDateTime(value),
                        'Введите дату и время в формате ДД.ММ.ГГГГ ЧЧ:ММ'
                    );
                if (field.kind === 'choice')
                    schema = schema.refine(
                        (value) =>
                            !value ||
                            field.options.some(
                                (option) => option.value === value
                            ),
                        'Выберите значение из списка'
                    );
                return [field.name, schema.default('')];
            }
        )
    );

export const reportSubmitFormSchema = z
    .object({
        clientReportId: z.string().trim().optional(),

        customerName: z
            .string()
            .trim()
            .min(1, 'Введите ФИО')
            .max(150, 'ФИО слишком длинное'),

        personalAccount: z
            .string()
            .trim()
            .min(1, 'Введите лицевой счет')
            .regex(/^\d{1,20}$/, 'Лицевой счет должен содержать только цифры'),

        comment: z.string().trim().max(1000, 'Комментарий слишком длинный'),
        address: z
            .object(
                Object.fromEntries(
                    [
                        'locality',
                        'street',
                        'house',
                        'building',
                        'apartment',
                        'room',
                    ].map((name) => [name, z.string().default('')])
                )
            )
            .prefault({}),
        actDetails: z.object(actFieldsSchema('actDetails')).prefault({}),

        meterBefore: z.object({
            ...actFieldsSchema('meterBefore'),
            type: optionalTrimmedString(40, 'Тип старого ПУ слишком длинный'),
            number: optionalTrimmedString(
                40,
                'Номер старого ПУ слишком длинный'
            ),
            isActualDifferent: z.boolean(),
            actualType: optionalTrimmedString(
                40,
                'Фактический тип ПУ слишком длинный'
            ),
            actualNumber: optionalTrimmedString(
                40,
                'Фактический номер ПУ слишком длинный'
            ),
        }),

        metering: z.object({
            ...actFieldsSchema('metering'),
            dismantlingCompleted: z.boolean(),
            oldReading: z
                .string()
                .trim()
                .refine(
                    (value) => !value || /^\d{1,9}([.,]\d{1,3})?$/.test(value),
                    'Введите корректные показания старого ПУ'
                ),
            newMeterType: requiredTrimmedString(
                40,
                'Введите тип нового ПУ',
                'Тип нового ПУ слишком длинный'
            ),
            newMeterNumber: requiredTrimmedString(
                40,
                'Введите номер нового ПУ',
                'Номер нового ПУ слишком длинный'
            ),
            sealLocation: z
                .string()
                .trim()
                .max(40, 'Место установки пломбы слишком длинное'),
            sealNumber: optionalTrimmedString(
                40,
                'Номер пломбы слишком длинный'
            ),
            installationReading: meterReadingField('показания при установке'),
        }),
        photos: z.object(reportPhotoFields),
        admission: z.object({
            ...actFieldsSchema('admission'),
            status: z.string().trim().min(1, 'Выберите статус допуска'),
            rejectionReason: z.string().trim(),
            rejectionComment: z
                .string()
                .trim()
                .max(500, 'Комментарий слишком длинный'),
        }),

        consumerContact: z.object({
            isRefusedContact: z.boolean(),
            phoneNumber: optionalPhoneField,
            phoneNumber2: optionalPhoneField,
            email: optionalEmailField,
            fullName: optionalTrimmedString(
                150,
                'ФИО контактного лица слишком длинное'
            ),
        }),

        actPdf: z.object({
            checksum: z.string().optional(),
            templateId: z.string().optional(),
            uri: z.string().trim().optional(),
            id: z.string().trim().optional(),
            isRefused: z.boolean(),
            signatures: z
                .object({
                    client: z
                        .array(
                            z.array(z.object({ x: z.number(), y: z.number() }))
                        )
                        .optional(),
                    utilityRepresentative: z
                        .array(
                            z.array(z.object({ x: z.number(), y: z.number() }))
                        )
                        .optional(),
                    master: z
                        .array(
                            z.array(z.object({ x: z.number(), y: z.number() }))
                        )
                        .optional(),
                })
                .optional(),
        }),
    })
    .superRefine((values, ctx) => {
        if (
            values.admission.status === 'NOT_ADMITTED' &&
            !values.admission.rejectionReason
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['admission', 'rejectionReason'],
                message: 'Выберите хотя бы одну причину недопуска',
            });
        }

        if (
            values.consumerContact.isRefusedContact &&
            (values.consumerContact.phoneNumber ||
                values.consumerContact.phoneNumber2 ||
                values.consumerContact.email ||
                values.consumerContact.fullName)
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['consumerContact', 'isRefusedContact'],
                message:
                    'При отказе от контактов поля контактных данных должны быть пустыми',
            });
        }

        if (
            !values.consumerContact.isRefusedContact &&
            !values.consumerContact.phoneNumber &&
            !values.consumerContact.phoneNumber2 &&
            !values.consumerContact.email &&
            !values.consumerContact.fullName
        ) {
            ctx.addIssue({
                code: 'custom',
                path: ['consumerContact', 'phoneNumber'],
                message:
                    'Укажите хотя бы один контактный способ или отметьте отказ',
            });
        }
    });
