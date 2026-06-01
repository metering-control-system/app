import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Card from '@/shared/components/wrapper/card';
import { taskStatus } from '@/features/tasks/constants/taskStatus';
import { taskPriority } from '@/features/tasks/constants/taskPriority';
import {
    taskPriorityColors,
    taskStatusColors,
} from '@/features/tasks/constants/taskColors';
import { colors } from '@/shared/consts/baseColors';
import useTaskOfflineMutationStore from '@/features/tasks/store/useTaskOfflineMutationStore';

const Task = ({ task }) => {
    const router = useRouter();
    const isPendingSync = useTaskOfflineMutationStore(
        (state) => state.tasksStatuses?.[task.id]
    );

    return (
        <Card
            clickable
            onPress={() => {
                router.push(`/(authorized)/taskDetails/${task.id}`);
            }}
            title={task.address?.display_address}
            titleAlign={'flex-start'}>
            <Text style={styles.cardText}>{task.consumer?.full_name}</Text>

            <View style={styles.cardPeriod}>
                <View style={styles.badges}>
                    <Text
                        numberOfLines={2}
                        ellipsizeMode='tail'
                        style={[
                            styles.badge,
                            taskStatusColors[task?.status] ??
                                taskStatusColors.NEW,
                        ]}>
                        {taskStatus[task?.status] ?? 'не назначен'}
                    </Text>
                    <Text
                        numberOfLines={2}
                        ellipsizeMode='tail'
                        style={[
                            styles.badge,
                            taskPriorityColors[task?.manual_priority] ??
                                taskPriorityColors.NOT_SPECIFIED,
                        ]}>
                        {taskPriority[task?.manual_priority] ?? 'не назначена'}
                    </Text>
                    {task.task_data?.has_request && (
                        <Text
                            numberOfLines={2}
                            ellipsizeMode='tail'
                            style={[styles.badge, colors.primary]}>
                            {task.task_data?.has_request ? 'по запросу' : null}
                        </Text>
                    )}
                </View>
                {isPendingSync && (
                    <Ionicons
                        name='cloud-upload-outline'
                        size={16}
                        color='#9a9a9a'
                    />
                )}
            </View>
            <View
                style={{
                    paddingVertical: 15,
                    borderTopWidth: 1,
                    borderColor: '#ddd',
                    columnGap: 15,
                }}>
                <Text
                    style={
                        styles.cardText
                    }>{`Тип ПУ: ${task.meter?.type}`}</Text>
                <Text
                    style={
                        styles.cardText
                    }>{`Лицевой счет: ${task.address?.account_number}`}</Text>
                <Text
                    style={
                        styles.cardText
                    }>{`Фаза ПУ: ${task.meter?.phase}`}</Text>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    cardText: { fontSize: 14, fontWeight: 'normal', color: '#9a9a9a' },
    cardPeriod: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    badges: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        flex: 1,
        flexWrap: 'wrap',
    },
    badge: {
        borderRadius: 5,
        paddingVertical: 2,
        paddingHorizontal: 5,
        borderWidth: 1,
        maxWidth: '50%',
    },
    btnPressed: { opacity: 0.75 },
});

export default Task;
