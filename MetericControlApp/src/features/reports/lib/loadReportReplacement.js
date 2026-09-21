import { enqueueReportSubmission } from './reportSubmissionQueue.js';

export const loadReportReplacement = ({
    taskId,
    fetchReport,
    applyReport,
    shouldApply = () => true,
}) =>
    enqueueReportSubmission(taskId, async () => {
        const report = await fetchReport(taskId);
        if (!report || !shouldApply()) return null;
        if (!report.id || Number(report['task_id']) !== Number(taskId)) {
            throw new Error(
                'Сервер вернул отчёт другой задачи или неполные данные.'
            );
        }
        applyReport(report);
        return report;
    });
