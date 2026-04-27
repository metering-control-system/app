import { FlatList, StyleSheet, Text } from 'react-native';

import Task from '@/features/tasks/components/task';
import useTasks from '@/features/tasks/hooks/useTasks';
import ScreenLoader from '@/shared/components/loader/screenLoader';
import useUpdateTasks from '@/features/tasks/hooks/useUpdateTasks';
import { useEffect } from 'react';

const TasksList = ({ setError }) => {
    const { tasks, isPending, error } = useTasks();
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
        <FlatList
            data={tasks ?? []}
            style={styles.list}
            renderItem={({ item: task }) => <Task task={task} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<Text>No tasks found.</Text>}
            refreshing={isRefrehsing}
            onRefresh={updateTasks}
        />
    );
};

const styles = StyleSheet.create({ list: { minWidth: '100%', gap: 20 } });

export default TasksList;
