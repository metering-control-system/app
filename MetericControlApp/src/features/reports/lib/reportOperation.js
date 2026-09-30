export const REPORT_OPERATION_KEY = ['report-operation'];

export const getReportOperationFilters = (taskId) => ({
    mutationKey: REPORT_OPERATION_KEY,
    status: 'pending',
    predicate: (mutation) =>
        String(mutation.state.variables?.taskId) === String(taskId),
});

export const startReportOperation = (queryClient, taskId, start) => {
    if (queryClient.isMutating(getReportOperationFilters(taskId))) {
        return Promise.resolve({ skipped: true, reason: 'busy' });
    }
    return start();
};
