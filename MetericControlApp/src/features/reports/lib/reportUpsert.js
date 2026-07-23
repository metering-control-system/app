export const selectReportForTask = (reports, taskId) => {
    if (!Array.isArray(reports)) {
        return null;
    }

    const normalizedTaskId = Number(taskId);

    return reports.reduce((selectedReport, report) => {
        if (Number(report?.['task_id']) !== normalizedTaskId) {
            return selectedReport;
        }

        if (!selectedReport || Number(report.id) > Number(selectedReport.id)) {
            return report;
        }

        return selectedReport;
    }, null);
};

export const buildReportUpsertRequest = ({ reportPayload, existingReport }) => {
    if (!existingReport) {
        return { operation: 'create', reportId: null, payload: reportPayload };
    }

    return {
        operation: 'update',
        reportId: existingReport.id,
        payload: {
            ...reportPayload,
            ['client_report_id']:
                existingReport['client_report_id'] ??
                reportPayload['client_report_id'],
        },
    };
};
