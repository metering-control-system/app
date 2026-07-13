import { StyleSheet, Text, View } from 'react-native';
import Card from '@/shared/components/wrapper/card';
import { useRouter } from 'expo-router';
import { FieldRow } from '@/shared/components/field/fieldRow';

const ShortenedTaskForm = ({ task, id }) => {
    const router = useRouter();

    const goToMainTask = () => {
        if (!task) {
            return;
        }
        router.push(`/(authorized)/taskFlow/${id}`);
    };

    return (
        <Card
            title='Информация о задаче'
            style={styles.form}
            clickable
            onPress={goToMainTask}>
            {task ? (
                <View style={styles.details}>
                    <FieldRow
                        value={task.consumer?.full_name}
                        defaultValue={'не назначено'}
                        label='ФИО'
                    />
                    <FieldRow
                        value={task.address?.display_address}
                        defaultValue={'не назначен'}
                        label='Адрес'
                    />
                    <FieldRow
                        value={task.address?.account_number}
                        defaultValue={'не назначен'}
                        label='Лицевой счет'
                    />
                </View>
            ) : (
                <View style={styles.details}>
                    <FieldRow
                        value={
                            '⚠️ Невозможно получить данные задачи. Возможно отсутствует подключение к интернету'
                        }
                        defaultValue={'не назначен'}
                        label='Лицевой счет'
                    />
                </View>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    form: {
        paddingHorizontal: 15,
        width: '100%',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
    },
    control: { paddingHorizontal: 5, marginVertical: 10 },
    label: { fontSize: 12, color: '#7a7a7a', marginBottom: 10 },
    details: {
        width: '100%',
        borderTopColor: '#ddd',
        borderTopWidth: 1,
        marginVertical: 10,
    },
    panel: { width: '100%', borderTopColor: '#ddd', borderTopWidth: 1 },
});

export default ShortenedTaskForm;
