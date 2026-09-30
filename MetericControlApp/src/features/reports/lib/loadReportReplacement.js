export const loadReportReplacement = async ({
    taskId,
    fetchReport,
    applyReport,
    shouldApply = () => true,
}) => {
    const report = await fetchReport(taskId);
    if (!report || !shouldApply()) return null;
    if (!report.id || Number(report['task_id']) !== Number(taskId)) {
        throw new Error(
            'Сервер вернул отчёт другой задачи или неполные данные.'
        );
    }
    applyReport(report);
    return report;
};
