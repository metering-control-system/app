import { z } from 'zod';

export const taskFormSchema = z.object({
    customer: z.object({
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
            .regex(/^\d{10,12}$/, 'Лицевой счет должен содержать 10-12 цифр'),
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
    }),
});
