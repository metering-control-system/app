export const isTaskReportReadOnly = (task, report, draft) => {
    if (!task || !report) return false;
    if (
        report.status === 'ON_REVIEW' &&
        ['pending', 'error', 'draft'].includes(draft?.reportState) &&
        (!task.is_team_task ||
            (draft.submissionReport?.updatedAt &&
                draft.submissionReport.id === report.id &&
                draft.submissionReport?.updatedAt === report.updated_at))
    ) {
        return false;
    }
    return ['ON_REVIEW', 'ON_ADMIN', 'ACCEPTED'].includes(report.status);
};

export const filterSubmittedTasks = (tasks, getReportForTask, drafts) =>
    (tasks ?? []).filter((task) => {
        const report = getReportForTask(task.id);
        const draft = drafts?.[task.id];
        const hasServerLock = typeof task.is_locked === 'boolean';
        const hasNewerReport =
            Date.parse(report?.updated_at) > Date.parse(task.updated_at);

        if (hasServerLock && !hasNewerReport) {
            if (!task.is_locked) return true;

            // Only a matching report revision can allow an unfinished upload.
            const canResumeUpload =
                task.status !== 'COMPLETED' &&
                task.report_status === 'ON_REVIEW' &&
                report?.status === task.report_status &&
                Number(report.id) === Number(task.report_id) &&
                !isTaskReportReadOnly(task, report, draft);
            return Boolean(canResumeUpload);
        }
        if (task.status === 'COMPLETED' && report?.status !== 'REJECTED') {
            return false;
        }
        return !isTaskReportReadOnly(task, report, draft);
    });
