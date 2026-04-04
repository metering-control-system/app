import { SectionList, StyleSheet, Text } from 'react-native';
// eslint-disable-next-line import/no-unresolved
import Task from '@/features/tasks/components/task';
// eslint-disable-next-line import/no-unresolved
import { tasks } from '@/shared/consts/tasks';

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
            desciptionContainerStyle={styles.list}
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

const colors = StyleSheet.create({
    warning: {
        backgroundColor: '#ffd6d6',
        borderColor: 'rgba(255, 58, 58, 0.3)',
        color: '#7a1c1c',
    },
    primary: {
        backgroundColor: '#d4f7cf',
        borderColor: 'rgba(84, 216, 56, 0.3)',
        color: '#1e4620',
    },
});
export default TasksList;
