import { preserveBrigadeDraft } from '@/features/reports/lib/preserveBrigadeDraft';
import { useIsMutating, useQuery, useQueryClient } from '@tanstack/react-query';
import { getReportByTaskId } from '@/features/reports/api/submitReportApi';
import useReportsStore from '@/features/reports/store/useReportsStore';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import { selectReportForTask } from '@/features/reports/lib/reportUpsert';
import { mergeReportUpdates } from '@/features/reports/lib/mergeReportUpdates';
import { isTaskReportReadOnly } from '@/features/tasks/lib/taskReportVisibility';
import { REPORT_OPERATION_KEY } from '@/features/reports/lib/reportOperation';
import { clearRemovedReportQueries } from '@/features/reports/lib/clearRemovedReportQueries';
import useNetwork from '@/shared/hooks/offline/useNetwork';

const useTaskReport = (task) => {
    const queryClient = useQueryClient();
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
            const expectedReports = (
                useReportsStore.getState().reports ?? []
            ).filter((report) => Number(report.task_id) === Number(task.id));
            const report = await getReportByTaskId(task.id, { signal });
            if (!signal.aborted) {
                const store = useReportsStore.getState();
                if (report) {
                    const draft = useReportDraftStore
                        .getState()
                        .getDraft(String(task.id));
                    if (
                        task.is_team_task &&
                        draft?.reportState === 'pending' &&
                        [
                            'ON_REVIEW',
                            'ON_ADMIN',
                            'ACCEPTED',
                            'REJECTED',
                        ].includes(report.status) &&
                        (draft.submissionReport?.id !== report.id ||
                            draft.submissionReport?.updatedAt !==
                                report.updated_at)
                    ) {
                        preserveBrigadeDraft({
                            taskId: task.id,
                            values: draft,
                            expectedDraft: draft,
                        });
                    }
                    store.setUpdatedReports([report]);
                } else {
                    const removedReports = store.removeReports(expectedReports);
                    clearRemovedReportQueries(
                        queryClient,
                        removedReports,
                        useReportsStore.getState().reports,
                        { cancelTaskQueries: false }
                    );
                }
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
        isQueued: draft?.reportState === 'pending',
        isReadOnly: !isSubmitting && isTaskReportReadOnly(task, report, draft),
        isPending: enabled && query.isPending,
        isFetching: enabled && query.isFetching,
        isError: enabled && query.isError,
        error: enabled && query.error,
        refetch: query.refetch,
    };
};

export default useTaskReport;
