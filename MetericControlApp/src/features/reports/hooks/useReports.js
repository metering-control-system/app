import { getReports } from '@/features/reports/api/getReportsApi';
import { useInfiniteQuery } from '@tanstack/react-query';
import useReportsSyncStore from '@/features/reports/store/useReportsSyncStore';
import { useEffect } from 'react';
import useReportsStore from '@/features/reports/store/useReportsStore';
import useNetwork from '@/shared/hooks/offline/useNetwork';

const useReports = () => {
    const { isChecked, isOnline } = useNetwork();
    const setListSnapshotAt = useReportsSyncStore(
        (state) => state.setListSnapshotAt
    );
    const setLastSyncAt = useReportsSyncStore((state) => state.setLastSyncAt);
    const setUpdatedReports = useReportsStore(
        (state) => state.setUpdatedReports
    );

    const {
        data,
        fetchNextPage,
        isPending,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
        error,
    } = useInfiniteQuery({
        queryKey: ['reports'],
        queryFn: async ({ pageParam }) => {
            const listSnapshotAt =
                useReportsSyncStore.getState().listSnapshotAt;
            const lastSyncAt = useReportsSyncStore.getState().lastSyncAt;
            const response = await getReports({
                limit: 5,
                // eslint-disable-next-line camelcase
                snapshot_at: listSnapshotAt,
                cursor: pageParam,
            });
            if (response.snapshot_at) {
                if (!listSnapshotAt) {
                    setListSnapshotAt(response.snapshot_at);
                }
                if (!lastSyncAt) {
                    setLastSyncAt(response.snapshot_at);
                }
            }
            return response;
        },
        initialPageParam: undefined,
        getNextPageParam: (lastPage) => lastPage.next_cursor ?? undefined,
        enabled: isOnline,
    });

    useEffect(() => {
        if (data) {
            const allReports = data.pages.flatMap((page) => page.reports ?? []);
            setUpdatedReports(allReports);
        }
    }, [data, setUpdatedReports]);

    useEffect(() => {
        if (!isChecked || isOnline || useReportsStore.persist.hasHydrated()) {
            return;
        }

        void useReportsStore.persist.rehydrate();
    }, [isChecked, isOnline]);

    return {
        fetchNextPage,
        error,
        isPending: !isChecked || (isOnline && isPending),
        isFetching,
        isFetchingNextPage,
        hasNextPage: isOnline && hasNextPage,
    };
};

export default useReports;
