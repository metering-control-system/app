export const REPORT_FORM_STEPS = [
    {
        key: 'beforeWork',
        title: 'До начала работ',
        fields: [
            'customerName',
            'personalAccount',
            'meterBefore',
            'comment',
            'clientReportId',
        ],
    },
    { key: 'metering', title: 'Демонтаж и монтаж', fields: ['metering'] },
    { key: 'photos', title: 'Фотофиксация', fields: ['photos'] },
    { key: 'admission', title: 'Итог и допуск', fields: ['admission'] },
    {
        key: 'contacts',
        title: 'Контактные данные',
        fields: ['consumerContact'],
    },
    { key: 'act', title: 'Акт допуска/замены', fields: ['actPdf'] },
];

const findFieldError = (error, field) => {
    if (!error || typeof error !== 'object') return null;
    if (typeof error.message === 'string') {
        return { field, message: error.message };
    }
    for (const [key, value] of Object.entries(error)) {
        if (['ref', 'type', 'types'].includes(key)) continue;
        const found = findFieldError(value, field ? `${field}.${key}` : key);
        if (found) return found;
    }
    return null;
};

export const getFirstReportValidationError = (errors) => {
    for (const [stepIndex, step] of REPORT_FORM_STEPS.entries()) {
        for (const field of step.fields) {
            const error = findFieldError(errors[field], field);
            if (error) return { ...error, stepIndex };
        }
    }
    return {
        field: null,
        stepIndex: null,
        message:
            findFieldError(errors)?.message ?? 'Проверьте заполнение отчёта.',
    };
};
