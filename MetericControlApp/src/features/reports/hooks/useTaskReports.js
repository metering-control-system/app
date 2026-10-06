import { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getReportsUpdate } from '@/features/reports/api/getReportsUpdateApi';
import useReportsStore from '@/features/reports/store/useReportsStore';
import useNetwork from '@/shared/hooks/offline/useNetwork';

const queryKey = ['reports', 'tasks'];

const useTaskReports = () => {
    const queryClient = useQueryClient();
    const { isChecked, isOnline } = useNetwork();
    const enabled = isChecked && isOnline;
    const fetchReports = useCallback(
        async ({ signal }) => {
            const lastSyncAt =
                queryClient.getQueryData(queryKey)?.snapshot_at ?? null;
            const data = await getReportsUpdate({ lastSyncAt, signal });
            if (!signal.aborted) {
                useReportsStore.getState().setUpdatedReports(data.reports);
            }
            return data;
        },
        [queryClient]
    );
    const query = useQuery({
        queryKey,
        queryFn: fetchReports,
        enabled,
        staleTime: 30 * 1000,
    });

    useFocusEffect(
        useCallback(() => {
            if (!enabled) return;
            void queryClient
                .fetchQuery({ queryKey, queryFn: fetchReports, staleTime: 0 })
                .catch(() => undefined);
        }, [enabled, queryClient, fetchReports])
    );

    return {
        isPending: enabled && query.isPending,
        isFetching: enabled && query.isFetching,
        error: enabled && query.error,
        refreshReports: () => enabled && query.refetch(),
    };
};

export default useTaskReports;
