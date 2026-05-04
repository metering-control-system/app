import { FlatList, StyleSheet, Text, View } from 'react-native';

import Task from '@/features/tasks/components/task';
import useTasks from '@/features/tasks/hooks/useTasks';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import useUpdateTasks from '@/features/tasks/hooks/useUpdateTasks';
import { useEffect, useRef, useState } from 'react';
import useTasksStore from '@/features/tasks/store/useTasksStore';

const TasksList = ({ setError }) => {
    const tasks = useTasksStore((state) => state.tasks);
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
    } = useTasks();
    const {
        updateTasks,
        isPending: isRefrehsing,
        error: refreshError,
    } = useUpdateTasks();

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
                data={tasks ?? []}
                style={styles.list}
                renderItem={({ item: task }) => <Task task={task} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text>No tasks found.</Text>}
                refreshing={isRefrehsing}
                onRefresh={updateTasks}
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
