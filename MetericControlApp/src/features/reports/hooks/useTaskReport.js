import { useIsMutating, useQuery } from '@tanstack/react-query';
import { getReportByTaskId } from '@/features/reports/api/submitReportApi';
import useReportsStore from '@/features/reports/store/useReportsStore';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import { selectReportForTask } from '@/features/reports/lib/reportUpsert';
import { mergeReportUpdates } from '@/features/reports/lib/mergeReportUpdates';
import { isTaskReportReadOnly } from '@/features/tasks/lib/taskReportVisibility';
import { REPORT_OPERATION_KEY } from '@/features/reports/lib/reportOperation';
import useNetwork from '@/shared/hooks/offline/useNetwork';

const useTaskReport = (task) => {
    const reports = useReportsStore((state) => state.reports);
    const draft = useReportDraftStore((state) => state.drafts?.[task?.id]);
    const { isChecked, isOnline } = useNetwork();
    const isSubmitting = useIsMutating({
        mutationKey: [...REPORT_OPERATION_KEY, 'submit'],
        predicate: (mutation) =>
            Number(mutation.state.variables?.taskId) === Number(task?.id),
    });
    const enabled = Boolean(task?.id) && isChecked && isOnline;
    const query = useQuery({
        queryKey: ['report', 'task', Number(task?.id)],
        queryFn: async ({ signal }) => {
            const report = await getReportByTaskId(task.id, { signal });
            if (report && !signal.aborted) {
                useReportsStore.getState().setUpdatedReports([report]);
            }
            return report;
        },
        enabled,
        retry: false,
    });
    const report = selectReportForTask(
        mergeReportUpdates(reports, query.data ? [query.data] : []),
        task?.id
    );

    return {
        report,
        data: report,
        isReadOnly: !isSubmitting && isTaskReportReadOnly(task, report, draft),
        isPending: enabled && query.isPending,
        isError: enabled && query.isError,
        error: enabled && query.error,
        refetch: query.refetch,
    };
};

export default useTaskReport;
