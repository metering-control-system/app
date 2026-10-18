import { selectReportForTask } from '@/features/reports/lib/reportUpsert';

export const clearRemovedReportQueries = (
    queryClient,
    removedReports,
    currentReports,
    { cancelTaskQueries = true } = {}
) => {
    if (!removedReports.length) return;
    const removedIds = new Set(removedReports.map((report) => report.id));
    void queryClient.cancelQueries({ queryKey: ['reports'], exact: true });
    queryClient.setQueryData(['reports'], (data) =>
        data?.pages
            ? {
                  ...data,
                  pages: data.pages.map((page) => ({
                      ...page,
                      reports: (page.reports ?? []).filter(
                          (report) => !removedIds.has(report.id)
                      ),
                  })),
              }
            : data
    );
    for (const report of removedReports) {
        const queryKey = ['report', report.id];
        if (!queryClient.getQueryState(queryKey)) continue;
        void queryClient.cancelQueries({ queryKey, exact: true });
        queryClient.setQueryData(queryKey, null, { updatedAt: 0 });
    }
    for (const taskId of new Set(
        removedReports.map((report) => Number(report.task_id))
    )) {
        const queryKey = ['report', 'task', taskId];
        if (!queryClient.getQueryState(queryKey)) continue;
        if (cancelTaskQueries)
            void queryClient.cancelQueries({ queryKey, exact: true });
        queryClient.setQueryData(
            queryKey,
            selectReportForTask(currentReports, taskId),
            { updatedAt: 0 }
        );
    }
};
