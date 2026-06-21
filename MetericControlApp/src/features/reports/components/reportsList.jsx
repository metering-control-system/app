import { FlatList, StyleSheet, Text, View } from 'react-native';

import Report from '@/features/reports/components/report';
import useReports from '@/features/reports/hooks/useReports';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import useUpdateReports from '@/features/reports/hooks/useUpdateReports';
import { useEffect, useRef, useState } from 'react';
import useReportsStore from '@/features/reports/store/useReportsStore';

const ReportsList = ({ setError }) => {
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
            setError(error?.message);
        } else if (refreshError) {
            setError(refreshError?.message);
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
                data={reports ?? []}
                style={styles.list}
                renderItem={({ item: report }) => <Report report={report} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text>No reports found.</Text>}
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
