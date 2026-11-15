import { ADMISSION_STATUS_OPTIONS } from '@/features/reports/constants/reportAdmissionStatus';
import { z } from 'zod';
import { createReportPhotoSlotRecord } from '@/features/reports/constants/reportPhotoConfigs';
import { REPORT_ACT_FIELDS } from '@/features/reports/constants/reportActFields';
import {
    REJECTION_REASON_OPTIONS,
    SEAL_LOCATION_OPTIONS,
} from '@/features/reports/constants/reportFieldOptions';
import {
    isValidReportEmail,
    isValidReportPhone,
} from '@/features/reports/lib/reportContactValidation';
import { splitReportContactName } from '@/features/reports/lib/reportContactValues';
import {
    reportTextSchema,
    reportReadingSchema,
    reportIntegerSchema,
    reportChoiceSchema,
} from '@/features/reports/model/reportFieldSchemas';
import {
    parseReportDate,
    parseReportDateTime,
} from '@/features/reports/lib/reportActFieldValues';

const optionalTrimmedString = (max, message) => reportTextSchema(max, message);
const requiredTrimmedString = (max, requiredMessage, maxMessage) =>
    reportTextSchema(max, maxMessage).min(1, requiredMessage);

const nullableContactText = (schema) =>
    z.preprocess((value) => (value === null ? '' : value), schema);
const optionalPhoneField = nullableContactText(
    reportTextSchema(128, 'Телефон: не более 128 символов').refine(
        isValidReportPhone,
        'Введите телефон в международном формате, например +7 921 123-45-67'
    )
);
const optionalEmailField = nullableContactText(
    reportTextSchema(254, 'Электронная почта: не более 254 символов').refine(
        isValidReportEmail,
        'Введите корректный адрес электронной почты'
    )
);

const photoArrayField = z.array(z.string().trim()).default([]);
const reportPhotoFields = createReportPhotoSlotRecord(() => photoArrayField);

const actFieldsSchema = (group) =>
    Object.fromEntries(
        REPORT_ACT_FIELDS.filter((field) => field.group === group).map(
            (field) => {
                if (field.kind === 'boolean')
                    return [
                        field.name,
                        z
                            .boolean({
                                error: 'Выберите «Да», «Нет» или «Не указано»',
                            })
                            .nullable()
                            .default(null),
                    ];
                if (field.kind === 'reading')
                    return [field.name, reportReadingSchema().default('')];
                if (field.kind === 'integer')
                    return [field.name, reportIntegerSchema().default('')];
                if (field.kind === 'choice')
                    return [
                        field.name,
                        reportChoiceSchema(field.options).default(''),
                    ];
                let schema = reportTextSchema(
                    field.kind === 'text' ? field.maxLength : null,
                    `${field.label}: значение слишком длинное`
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
                return [
                    field.name,
                    ['date', 'datetime'].includes(field.kind)
                        ? z
                              .preprocess(
                                  (value) => (value === null ? '' : value),
                                  schema
                              )
                              .default('')
                        : schema.default(''),
                ];
            }
        )
    );

export const reportSubmitFormSchema = z
    .object({
        clientReportId: z
            .string()
            .trim()
            .refine(
                (value) => !value || z.guid().safeParse(value).success,
                'Некорректный идентификатор отчёта'
            )
            .optional(),

        customerName: z
            .string()
            .trim()
            .min(1, 'Введите ФИО')
            .max(150, 'ФИО слишком длинное'),

        personalAccount: z
            .string()
            .trim()
            .max(20, 'Лицевой счет слишком длинный')
            .regex(/^\d*$/, 'Лицевой счет должен содержать только цифры')
            .default(''),

        comment: reportTextSchema(),
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
            type: optionalTrimmedString(
                40,
                'Тип старого ПУ слишком длинный'
            ).default(''),
            number: optionalTrimmedString(
                40,
                'Номер старого ПУ слишком длинный'
            ).default(''),
            isActualDifferent: z.boolean().default(false),
            actualType: optionalTrimmedString(
                40,
                'Фактический тип ПУ слишком длинный'
            ).default(''),
            actualNumber: optionalTrimmedString(
                40,
                'Фактический номер ПУ слишком длинный'
            ).default(''),
        }),

        metering: z.object({
            ...actFieldsSchema('metering'),
            dismantlingCompleted: z.boolean({
                error: 'Укажите, выполнен ли демонтаж',
            }),
            oldReading: reportReadingSchema().default(''),
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
            sealLocation: reportChoiceSchema(SEAL_LOCATION_OPTIONS).default(''),
            sealNumber: optionalTrimmedString(
                40,
                'Номер пломбы слишком длинный'
            ).default(''),
            installationReading: reportReadingSchema(
                'Введите показания при установке'
            ),
        }),
        photos: z.object(reportPhotoFields),
        admission: z.object({
            ...actFieldsSchema('admission'),
            status: reportChoiceSchema(
                ADMISSION_STATUS_OPTIONS,
                'Выберите статус допуска'
            ),
            rejectionReason: reportChoiceSchema(
                REJECTION_REASON_OPTIONS
            ).default(''),
            rejectionComment: reportTextSchema().default(''),
        }),

        consumerContact: z.object({
            isRefusedContact: z
                .boolean({ error: 'Укажите отказ от контактов' })
                .default(false),
            phoneNumber: optionalPhoneField.default(''),
            phoneNumber2: optionalPhoneField.default(''),
            email: optionalEmailField.default(''),
            fullName: reportTextSchema()
                .refine(
                    (value) =>
                        Object.values(splitReportContactName(value)).every(
                            (part) => [...part].length <= 40
                        ),
                    'Фамилия, имя и отчество: не более 40 символов в каждом поле'
                )
                .default(''),
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
        if (!values.actPdf.isRefused && !values.actPdf.uri) {
            ctx.addIssue({
                code: 'custom',
                path: ['actPdf', 'uri'],
                message:
                    'Сгенерируйте акт перед отправкой отчёта. После доработки данных акт нужно создать и подписать заново.',
            });
        }
    });
