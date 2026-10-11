import { Pressable, StyleSheet, Text, View } from 'react-native';

const TaskReportLookupError = ({ onRetry, onClose }) => (
    <View style={styles.container}>
        <Text>
            Не удалось проверить, есть ли отчёт по задаче. Проверьте подключение
            и повторите попытку.
        </Text>
        <Pressable accessibilityRole='button' onPress={onRetry}>
            <Text>Повторить</Text>
        </Pressable>
        <Pressable accessibilityRole='button' onPress={onClose}>
            <Text>Закрыть</Text>
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
