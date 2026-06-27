import { z } from 'zod';

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
        'Введите корректный email'
    );

export const reportSubmitFormSchema = z
    .object({
        clientReportId: z.string().trim().optional(),

        customerName: z
            .string()
            .trim()
            .min(1, 'Введите ФИО')
            .min(5, 'ФИО слишком короткое')
            .max(150, 'ФИО слишком длинное'),

        personalAccount: z
            .string()
            .trim()
            .min(1, 'Введите лицевой счет')
            .regex(/^\d{1,20}$/, 'Лицевой счет должен содержать только цифры'),

        comment: z.string().trim().max(1000, 'Комментарий слишком длинный'),

        meterBefore: z.object({
            type: requiredTrimmedString(
                40,
                'Введите тип старого ПУ',
                'Тип старого ПУ слишком длинный'
            ),
            number: requiredTrimmedString(
                40,
                'Введите номер старого ПУ',
                'Номер старого ПУ слишком длинный'
            ),
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
            dismantlingCompleted: z.boolean(),
            oldReading: meterReadingField('последние показания старого ПУ'),
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
                .min(1, 'Выберите место установки пломбы')
                .max(40, 'Место установки пломбы слишком длинное'),
            sealNumber: requiredTrimmedString(
                40,
                'Введите номер пломбы',
                'Номер пломбы слишком длинный'
            ),
            installationReading: meterReadingField('показания при установке'),
        }),
        admission: z.object({
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
