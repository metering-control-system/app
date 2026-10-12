export const createReportValidationError = (issues) => {
    const validationErrors = {};
    for (const issue of issues) {
        let target = validationErrors;
        issue.path.slice(0, -1).forEach((part) => {
            target[part] ??= {};
            target = target[part];
        });
        const field = issue.path.at(-1) ?? 'root';
        target[field] ??= { message: issue.message };
    }
    return Object.assign(new Error(issues[0]?.message ?? 'Проверьте отчёт'), {
        code: 'REPORT_VALIDATION_ERROR',
        issues,
        validationErrors,
    });
};
