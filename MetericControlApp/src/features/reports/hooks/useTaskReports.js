import { useCallback } from 'react';
import { useFocusEffect, useIsFocused } from 'expo-router';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import useUpdateReports, {
    TASK_REPORTS_QUERY_KEY,
    REPORTS_STALE_TIME,
    REPORTS_FULL_SYNC_INTERVAL,
} from '@/features/reports/hooks/useUpdateReports';
import useNetwork from '@/shared/hooks/offline/useNetwork';

const useTaskReports = () => {
    const queryClient = useQueryClient();
    const { isChecked, isOnline } = useNetwork();
    const isFocused = useIsFocused();
    const enabled = isChecked && isOnline && isFocused;
    const {
        syncReports,
        updateReportsAsync,
        isPending: isRefreshing,
        error: refreshError,
    } = useUpdateReports();
    const fetchReports = useCallback(
        ({ signal }) => syncReports({ signal }),
        [syncReports]
    );
    const query = useQuery({
        queryKey: TASK_REPORTS_QUERY_KEY,
        queryFn: fetchReports,
        enabled,
        staleTime: REPORTS_STALE_TIME,
        refetchInterval: REPORTS_FULL_SYNC_INTERVAL,
    });

    useFocusEffect(
        useCallback(() => {
            if (!enabled) return;
            void queryClient
                .fetchQuery({
                    queryKey: TASK_REPORTS_QUERY_KEY,
                    queryFn: fetchReports,
                    staleTime: REPORTS_STALE_TIME,
                })
                .catch(() => undefined);
        }, [enabled, queryClient, fetchReports])
    );

    return {
        isPending: enabled && query.isPending,
        isFetching: enabled && (query.isFetching || isRefreshing),
        error: enabled && (refreshError ?? query.error),
        refreshReports: updateReportsAsync,
    };
};

export default useTaskReports;
