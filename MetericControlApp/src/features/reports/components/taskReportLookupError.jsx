import { Pressable, StyleSheet, Text, View } from 'react-native';

const TaskReportLookupError = ({ onRetry }) => (
    <View style={styles.container}>
        <Text>Не удалось проверить, есть ли отчёт по задаче.</Text>
        <Pressable onPress={onRetry}>
            <Text>Повторить</Text>
        </Pressable>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
});

export default TaskReportLookupError;
