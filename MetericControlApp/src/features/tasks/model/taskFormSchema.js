import { z } from 'zod';

export const taskFormSchema = z.object({
    consumer: z.object({
        // eslint-disable-next-line camelcase
        full_name: z
            .string()
            .trim()
            .min(1, 'Введите ФИО')
            .max(150, 'ФИО слишком длинное'),
        // eslint-disable-next-line camelcase
        phone_number: z
            .string()
            .trim()
            .min(1, 'Введите номер телефона')
            .transform((value) => value.replace(/[^\d+]/g, ''))
            .refine(
                (value) => /^(?:\+7|7|8)\d{10}$/.test(value),
                'Телефон должен быть в формате +7XXXXXXXXXX'
            ),
    }),
    address: z.object({
        // eslint-disable-next-line camelcase
        account_number: z
            .string()
            .trim()
            .min(1, 'Введите лицевой счет')
            .regex(/^\d*$/, 'Лицевой счет должен содержать только цифры'),
    }),

    meter: z.object({
        type: z
            .string()
            .trim()
            .min(1, 'Введите тип старого ПУ')
            .max(40, 'Тип старого ПУ слишком длинный'),

        number: z
            .string()
            .trim()
            .min(1, 'Введите номер старого ПУ')
            .max(40, 'Номер старого ПУ слишком длинный'),

        // eslint-disable-next-line camelcase
        installation_location: z
            .string()
            .trim()
            .min(1, 'Введите место установки'),
    }),
    // eslint-disable-next-line camelcase
    task_data: z.object({ service_reason: z.string().trim() }).optional(),
});
