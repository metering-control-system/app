import { z } from 'zod';
import { reportSubmitFormSchema } from '../model/reportSubmitFormSchema.js';
import { createReportValidationError } from './reportValidationError.js';

const schema = reportSubmitFormSchema
    .pick({
        clientReportId: true,
        meterBefore: true,
        metering: true,
        admission: true,
        consumerContact: true,
        actDetails: true,
        comment: true,
    })
    .extend({
        taskId: z.coerce
            .number({ error: 'Не удалось определить задачу' })
            .int('Некорректный номер задачи')
            .positive('Некорректный номер задачи'),
    });

export const validateReportValues = (values, taskId) => {
    const result = schema.safeParse({ ...values, taskId });
    if (!result.success) throw createReportValidationError(result.error.issues);
};
