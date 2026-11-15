import { FlatList, StyleSheet, Text, View } from 'react-native';

import useReports from '@/features/reports/hooks/useReports';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import useUpdateReports from '@/features/reports/hooks/useUpdateReports';
import { useEffect, useMemo, useRef, useState } from 'react';
import useReportsStore from '@/features/reports/store/useReportsStore';
import { filteringBy } from '@/features/reports/lib/filteringReports';
import { reportStatus } from '@/features/reports/constants/reportStatus';
import { sortingBy } from '@/features/reports/lib/sortingReports';
import { reportAdmission } from '@/features/reports/constants/reportAdmissionStatus';
import { filterBySearch } from '@/shared/lib/collections/filterBySearch';

const ReportsList = ({
    setError,
    sorting,
    filtering,
    search,
    renderReport,
}) => {
    const reports = useReportsStore((state) => state.reports);
    const [listHeight, setListHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const isAutoFetchingRef = useRef(false);

    const {
        fetchNextPage,
        isPending,
        error,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
    } = useReports();
    const {
        updateReports,
        isPending: isRefreshing,
        error: refreshError,
    } = useUpdateReports();

    useEffect(() => {
        setError(null);
        if (error) {
            setError(
                'Не удалось загрузить отчёты. Проверьте подключение и обновите список.'
            );
        } else if (refreshError) {
            setError(
                'Не удалось загрузить отчёты. Проверьте подключение и обновите список.'
            );
        }
    }, [error, refreshError, setError]);

    useEffect(() => {
        if (
            !hasNextPage ||
            isFetching ||
            isFetchingNextPage ||
            isAutoFetchingRef.current
        ) {
            return;
        }

        if (
            listHeight > 0 &&
            contentHeight > 0 &&
            contentHeight <= listHeight
        ) {
            isAutoFetchingRef.current = true;
            fetchNextPage({ cancelRefetch: false }).finally(() => {
                isAutoFetchingRef.current = false;
            });
        }
    }, [
        contentHeight,
        listHeight,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        fetchNextPage,
    ]);

    const displayedReports = useMemo(() => {
        const selected = [...filtering];
        const reportsStatuses = selected.filter((s) => reportStatus[s]);
        const reportsAdmissionStatuses = selected.filter(
            (s) => reportAdmission[s]
        );
        const filtered = filteringBy(
            { statuses: reportsStatuses, admission: reportsAdmissionStatuses },
            reports
        );
        const sorted = sortingBy(filtered, sorting);
        return filterBySearch({ query: sorted, input: search });
    }, [reports, filtering, sorting, search]);

    if (isPending) {
        return <ScreenLoader />;
    }

    return (
        <View
            style={styles.container}
            onLayout={(event) => {
                setListHeight(event.nativeEvent.layout.height);
            }}>
            <FlatList
                data={displayedReports}
                style={styles.list}
                renderItem={renderReport}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text>Отчёты не найдены</Text>}
                refreshing={isRefreshing}
                onRefresh={updateReports}
                onContentSizeChange={(_, height) => {
                    setContentHeight(height);
                }}
                onEndReached={() => {
                    if (hasNextPage && !isFetching && !isFetchingNextPage) {
                        fetchNextPage({ cancelRefetch: false });
                    }
                }}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                    isFetchingNextPage && (
                        <Text
                            style={{
                                alignSelf: 'center',
                                marginHorizontal: 10,
                            }}>
                            Идет загрузка...
                        </Text>
                    )
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, minWidth: '100%' },
    list: { minWidth: '100%', gap: 20 },
});

export default ReportsList;
