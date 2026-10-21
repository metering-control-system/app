import { REPORT_STATUS } from '@/features/reports/constants/reportStatus';
import {
    getReportByTaskId,
    submitReport,
} from '@/features/reports/api/submitReportApi';

export const isConfirmedReportSubmission = (report, submission) =>
    Boolean(submission?.clientReportId) &&
    Number(report?.id) === Number(submission?.reportId) &&
    Number(report?.task_id) === Number(submission?.taskId) &&
    report?.client_report_id === submission?.clientReportId &&
    [
        REPORT_STATUS.ON_REVIEW,
        REPORT_STATUS.ON_ADMIN,
        REPORT_STATUS.ACCEPTED,
    ].includes(report?.status);

export const finalizeReportSubmission = async (submission) => {
    try {
        const report = await submitReport(submission.reportId);
        if (isConfirmedReportSubmission(report, submission)) return report;
        throw new Error('Не удалось получить подтверждённый отчёт');
    } catch (error) {
        const status = error.response?.status;
        const ambiguous = !error.response || status === 408 || status >= 500;
        if (ambiguous) {
            try {
                const report = await getReportByTaskId(submission.taskId);
                if (isConfirmedReportSubmission(report, submission))
                    return report;
            } catch {
                throw error;
            }
        }
        throw error;
    }
};
