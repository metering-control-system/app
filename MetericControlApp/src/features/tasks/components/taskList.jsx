import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useTasks from '@/features/tasks/hooks/useTasks';
import useUpdateTasks from '@/features/tasks/hooks/useUpdateTasks';
import useTasksStore from '@/features/tasks/store/useTasksStore';
import { taskStatus } from '@/features/tasks/constants/taskStatus';
import { taskPriority } from '@/features/tasks/constants/taskPriority';
import { sortBy } from '@/features/tasks/lib/sortTasks';
import { filterBy } from '@/features/tasks/lib/filterTasks';
import { filterBySearch } from '@/shared/lib/collections/filterBySearch';

import Task from '@/features/tasks/components/task';
import ScreenLoader from '@/shared/components/loader/screenLoader';

const TasksList = ({
    tasks: providedTasks,
    onTaskPress,
    syncingRecords,
    refreshing = false,
    onRefresh,
    emptyMessage = 'Задачи не найдены',
    onLayout,
    onContentSizeChange,
    onEndReached,
    isFetchingNextPage: providedIsFetchingNextPage = false,
    setError,
    filtering,
    sorting,
    search,
    sync,
    prepareTasks,
    isReportsPending,
    isReportsFetching,
    reportsError,
    refreshReports,
}) => {
    const isProvided = providedTasks !== undefined;
    const tasks = useTasksStore((state) => state.tasks);
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
    } = useTasks(!isProvided);
    const {
        updateTasks,
        isPending: isRefreshing,
        error: refreshError,
    } = useUpdateTasks();

    useEffect(() => {
        if (isProvided) return;
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
    }, [isProvided, error, refreshError, reportsError, setError]);

    useEffect(() => {
        if (
            isProvided ||
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
        isProvided,
        contentHeight,
        listHeight,
        hasNextPage,
        isFetching,
        isFetchingNextPage,
        fetchNextPage,
    ]);

    const displayedTasks = useMemo(() => {
        if (isProvided) return providedTasks;
        const selected = [...filtering];
        const tasksStatuses = selected.filter((s) => taskStatus[s]);
        const tasksPriority = selected.filter((s) => taskPriority[s]);
        const filtered = filterBy(
            { statuses: tasksStatuses, priority: tasksPriority },
            prepareTasks(tasks)
        );
        const sorted = sortBy(filtered, sorting);
        return filterBySearch({ query: sorted, input: search });
    }, [
        isProvided,
        providedTasks,
        tasks,
        prepareTasks,
        filtering,
        sorting,
        search,
    ]);

    const handleRefresh = async () => {
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

    const renderItem = useCallback(
        ({ item }) => (
            <Task
                task={item}
                onPress={onTaskPress ? () => onTaskPress(item) : undefined}
                hasPendingTaskReport={!!syncingRecords?.[item.id]}
            />
        ),
        [onTaskPress, syncingRecords]
    );
    if (!isProvided && (isPending || isReportsPending)) return <ScreenLoader />;

    return (
        <View
            style={styles.container}
            onLayout={
                isProvided
                    ? onLayout
                    : (event) => setListHeight(event.nativeEvent.layout.height)
            }>
            <FlatList
                data={displayedTasks}
                style={styles.list}
                renderItem={renderItem}
                keyExtractor={(task) => String(task.id)}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text>{emptyMessage}</Text>}
                refreshing={
                    isProvided
                        ? refreshing
                        : isRefreshingList || isRefreshing || isReportsFetching
                }
                onRefresh={isProvided ? onRefresh : handleRefresh}
                onContentSizeChange={
                    isProvided
                        ? onContentSizeChange
                        : (_, height) => setContentHeight(height)
                }
                onEndReached={
                    isProvided
                        ? onEndReached
                        : () => {
                              if (
                                  hasNextPage &&
                                  !isFetching &&
                                  !isFetchingNextPage
                              ) {
                                  fetchNextPage({ cancelRefetch: false });
                              }
                          }
                }
                onEndReachedThreshold={0.5}
                maxToRenderPerBatch={10}
                windowSize={7}
                ListFooterComponent={
                    (
                        isProvided
                            ? providedIsFetchingNextPage
                            : isFetchingNextPage
                    ) ? (
                        <Text>Идет загрузка...</Text>
                    ) : null
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
