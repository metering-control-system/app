import { FlatList, StyleSheet, Text, View } from 'react-native';

import Task from '@/features/tasks/components/task';
import useTasks from '@/features/tasks/hooks/useTasks';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import useUpdateTasks from '@/features/tasks/hooks/useUpdateTasks';
import { useEffect, useMemo, useRef, useState } from 'react';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import { taskStatus } from '@/features/tasks/constants/taskStatus';
import { sortBy } from '@/features/tasks/lib/sortTasks';
import { taskPriority } from '@/features/tasks/constants/taskPriority';
import { filterBy } from '@/features/tasks/lib/filterTasks';
import { filterBySearch } from '@/shared/lib/collections/filterBySearch';
import useReportsStore from '@/features/reports/store/useReportsStore';
import useReportDraftStore from '@/features/reports/store/useReportDraftStore';
import useTaskReports from '@/features/reports/hooks/useTaskReports';
import { filterSubmittedTasks } from '@/features/tasks/lib/taskReportVisibility';
import { selectReportForTask } from '@/features/reports/lib/reportUpsert';

const TasksList = ({
    setError,
    filtering,
    sorting,
    search,
    sync,
    syncingRecords,
}) => {
    const tasks = useTasksStore((state) => state.tasks);
    const reports = useReportsStore((state) => state.reports);
    const drafts = useReportDraftStore((state) => state.drafts);
    const {
        isPending: isReportsPending,
        isFetching: isReportsFetching,
        error: reportsError,
        refreshReports,
    } = useTaskReports();
    const [listHeight, setListHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [isRefreshingList, setIsRefreshingList] = useState(false);
    const isAutoFetchingRef = useRef(false);

    const {
        fetchNextPage,
        isPending,
        error,
        isFetching,
        isFetchingNextPage,
        hasNextPage,
    } = useTasks();
    const {
        updateTasks,
        isPending: isRefrehsing,
        error: refreshError,
    } = useUpdateTasks();

    useEffect(() => {
        setError(null);
        if (error) {
            setError(
                'Не удалось загрузить задачи. Проверьте подключение и обновите список.'
            );
        } else if (refreshError) {
            setError(
                'Не удалось загрузить задачи. Проверьте подключение и обновите список.'
            );
        } else if (reportsError) {
            setError('Не удалось обновить статусы отчётов.');
        }
    }, [error, refreshError, reportsError, setError]);

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

    const displayedTasks = useMemo(() => {
        const selected = [...filtering];
        const tasksStatuses = selected.filter((s) => taskStatus[s]);
        const tasksPriority = selected.filter((s) => taskPriority[s]);
        const filtered = filterBy(
            { statuses: tasksStatuses, priority: tasksPriority },
            filterSubmittedTasks(tasks, reports, drafts)
        );
        const sorted = sortBy(filtered, sorting);
        return filterBySearch({ query: sorted, input: search });
    }, [tasks, reports, drafts, filtering, sorting, search]);

    const onRefresh = async () => {
        setIsRefreshingList(true);
        try {
            const [tasksResult, reportsResult, syncResult] =
                await Promise.allSettled(
                    [updateTasks, refreshReports, sync].map((operation) =>
                        Promise.resolve().then(operation)
                    )
                );
            if (syncResult.status === 'rejected') {
                setError('Не удалось синхронизировать отчёты.');
            } else if (syncResult.value) {
                setError(`Не синхронизировано отчётов: ${syncResult.value}.`);
            } else if (reportsResult.status === 'rejected') {
                setError('Не удалось обновить статусы отчётов.');
            } else if (tasksResult.status === 'rejected') {
                setError('Не удалось обновить задачи.');
            }
        } finally {
            setIsRefreshingList(false);
        }
    };

    if (isPending || isReportsPending) {
        return <ScreenLoader />;
    }

    return (
        <View
            style={styles.container}
            onLayout={(event) => {
                setListHeight(event.nativeEvent.layout.height);
            }}>
            <FlatList
                data={displayedTasks}
                style={styles.list}
                renderItem={({ item: task }) => (
                    <Task
                        task={task}
                        hasPendingTaskReport={!!syncingRecords[task.id]}
                        needsReportRevision={
                            selectReportForTask(reports, task.id)?.status ===
                            'REJECTED'
                        }
                    />
                )}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text>Задачи не найдены</Text>}
                refreshing={
                    isRefreshingList || isRefrehsing || isReportsFetching
                }
                onRefresh={onRefresh}
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

export default TasksList;
