import { selectReportForTask } from '../../reports/lib/reportUpsert.js';

export const isTaskReportReadOnly = (task, report, draft) => {
    if (!task || task.is_team_task || !report) return false;
    if (
        report.status === 'ON_REVIEW' &&
        ['pending', 'error'].includes(draft?.reportState)
    ) {
        return false;
    }
    return ['ON_REVIEW', 'ON_ADMIN', 'ACCEPTED'].includes(report.status);
};

export const filterSubmittedTasks = (tasks, reports, drafts) =>
    (tasks ?? []).filter((task) => {
        const report = selectReportForTask(reports, task.id);
        if (
            !task.is_team_task &&
            task.status === 'COMPLETED' &&
            report?.status !== 'REJECTED'
        ) {
            return false;
        }
        return !isTaskReportReadOnly(task, report, drafts?.[task.id]);
    });
