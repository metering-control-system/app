import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { getReportsUpdate } from '@/features/reports/api/getReportsUpdateApi';
import useReportsStore from '@/features/reports/store/useReportsStore';
import useReportsSyncStore from '@/features/reports/store/useReportsSyncStore';
import { clearRemovedReportQueries } from '@/features/reports/lib/clearRemovedReportQueries';
import useNetwork from '@/shared/hooks/offline/useNetwork';

export const TASK_REPORTS_QUERY_KEY = ['reports', 'tasks'];
export const REPORTS_STALE_TIME = 30 * 1000;
export const REPORTS_FULL_SYNC_INTERVAL = 5 * 60 * 1000;

const useUpdateReports = () => {
    const queryClient = useQueryClient();
    const { isOnline, isChecked } = useNetwork();
    const syncReports = useCallback(
        async ({ signal, full = false } = {}) => {
            const { lastSyncAt, lastFullSyncAt, generation } =
                useReportsSyncStore.getState();
            const fullSnapshot =
                full ||
                !lastSyncAt ||
                lastFullSyncAt === null ||
                Date.now() - lastFullSyncAt >= REPORTS_FULL_SYNC_INTERVAL;
            const data = await getReportsUpdate({
                lastSyncAt: fullSnapshot ? null : lastSyncAt,
                signal,
            });
            if (
                signal?.aborted ||
                generation !== useReportsSyncStore.getState().generation
            ) {
                return null;
            }

            const removedReports = useReportsStore
                .getState()
                .setUpdatedReports(data.reports, {
                    snapshotAt: fullSnapshot ? data.snapshot_at : undefined,
                });
            clearRemovedReportQueries(
                queryClient,
                removedReports,
                useReportsStore.getState().reports
            );
            useReportsSyncStore
                .getState()
                .recordSync(data.snapshot_at, fullSnapshot);
            return data;
        },
        [queryClient]
    );

    const { mutate, mutateAsync, error, isPending } = useMutation({
        mutationFn: () => syncReports({ full: true }),
        onSuccess: (data) => {
            if (data && queryClient.getQueryState(TASK_REPORTS_QUERY_KEY)) {
                queryClient.setQueryData(TASK_REPORTS_QUERY_KEY, data);
            }
        },
    });

    const updateReports = () => {
        if (!isChecked || !isOnline) {
            return;
        }

        mutate();
    };

    const updateReportsAsync = () => {
        if (!isChecked || !isOnline) return Promise.resolve();
        return mutateAsync();
    };

    return { syncReports, updateReports, updateReportsAsync, error, isPending };
};

export default useUpdateReports;
