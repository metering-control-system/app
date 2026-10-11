import { z } from 'zod';
import { reportSubmitFormSchema } from '../model/reportSubmitFormSchema.js';
import { createReportValidationError } from './reportValidationError.js';

const {
    clientReportId,
    meterBefore,
    metering,
    admission,
    consumerContact,
    actDetails,
    comment,
} = reportSubmitFormSchema.shape;
const schema = z.object({
    clientReportId,
    meterBefore,
    metering,
    admission,
    consumerContact,
    actDetails,
    comment,
    taskId: z.coerce
        .number({ error: 'Не удалось определить задачу' })
        .int('Некорректный номер задачи')
        .positive('Некорректный номер задачи'),
});

export const validateReportValues = (values, taskId) => {
    const result = schema.safeParse({ ...values, taskId });
    if (!result.success) throw createReportValidationError(result.error.issues);
};
