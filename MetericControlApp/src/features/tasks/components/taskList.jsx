import { SectionList, StyleSheet, Text, View } from 'react-native';

import Task from '@/features/tasks/components/task';
import useTasks from '@/features/tasks/hooks/useTasks';
import { processTasks } from '@/features/tasks/components/taskSort';

import { colors } from '@/shared/consts/baseColors';

const TasksList = () => {
    const { tasks = [] } = useTasks();
    const { groupedPriority, groupedNormal } = processTasks(tasks);

    return (
        <SectionList
            style={styles.list}
            sections={[
                { title: 'Срочные', data: groupedPriority },
                { title: 'Обычные', data: groupedNormal },
            ]}
            renderItem={({ item: group }) => (
                <View>
                    {group.map((task) => (
                        <Task key={task.id} task={task} />
                    ))}
                </View>
            )}
            keyExtractor={(item) => item[0]?.id?.toString() || 'key'}
            contentContainerStyle={styles.list}
            renderSectionHeader={({ section }) => (
                <Text
                    style={[
                        styles.listHeader,
                        section?.data[0]?.[0]?.manual_priority !==
                        'NOT_SPECIFIED'
                            ? colors.warning
                            : colors.primary,
                    ]}>
                    {section.title}
                </Text>
            )}
        />
    );
};

const styles = StyleSheet.create({
    list: { minWidth: '100%' },
    listHeader: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 5,
        paddingVertical: 10,
        borderRadius: 24,
        borderStyle: 'solid',
        borderWidth: 1,
        marginVertical: 5,
    },
});

export default TasksList;
