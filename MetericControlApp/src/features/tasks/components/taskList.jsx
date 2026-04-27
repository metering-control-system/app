import { FlatList, StyleSheet, Text } from 'react-native';

import Task from '@/features/tasks/components/task';
import useTasks from '@/features/tasks/hooks/useTasks';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import useUpdateTasks from '@/features/tasks/hooks/useUpdateTasks';
import { useEffect } from 'react';
import useTasksStore from '@/features/tasks/store/useTasksStore';

const TasksList = ({ setError }) => {
    const tasks = useTasksStore((state) => state.tasks);
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
    }, [error, refreshError]);

    if (isPending) {
        return <ScreenLoader />;
    }

    return (
        <>
            <FlatList
                data={tasks ?? []}
                style={styles.list}
                renderItem={({ item: task }) => <Task task={task} />}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.list}
                ListEmptyComponent={<Text>No tasks found.</Text>}
                refreshing={isRefrehsing}
                onRefresh={updateTasks}
                onEndReached={() => {
                    if (hasNextPage && !isFetching) {
                        fetchNextPage({ cancelRefetch: false });
                    }
                }}
                onEndReachedThreshold={1}
            />
            {isFetchingNextPage && (
                <Text style={{ alignSelf: 'center', marginHorizontal: 10 }}>
                    Идет загрузка...
                </Text>
            )}
        </>
    );
};

const styles = StyleSheet.create({ list: { minWidth: '100%', gap: 20 } });

export default TasksList;
