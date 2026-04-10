import { SectionList, StyleSheet, Text } from 'react-native';

import Task from '@/features/tasks/components/task';

import { tasks } from '@/shared/consts/tasks';
import { colors } from '@/shared/consts/baseColors';

const TasksList = () => {
    return (
        <SectionList
            style={styles.list}
            sections={[
                {
                    title: 'Срочные',
                    data: tasks.filter((task) => task.isUrgent),
                },
                {
                    title: 'Обычные',
                    data: tasks.filter((task) => !task.isUrgent),
                },
            ]}
            renderItem={({ item: task }) => <Task task={task} />}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderSectionHeader={({ section }) => (
                <Text
                    style={[
                        styles.listHeader,
                        section?.data[0]?.isUrgent
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
