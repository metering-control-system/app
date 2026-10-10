import { StyleSheet, Text, View } from 'react-native';
import Card from '@/shared/components/wrapper/card';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const ShortenedTaskForm = ({ task, id, clickable = false }) => {
    const router = useRouter();

    const goToMainTask = () => {
        if (!task || !clickable) {
            return;
        }
        router.push(`/(authorized)/taskFlow/${id}`);
    };

    return (
        <Card
            style={styles.form}
            clickable={clickable}
            onPress={clickable ? goToMainTask : undefined}>
            <View style={styles.heading}>
                <Text style={styles.title}>Информация о задаче</Text>
                {task && clickable && (
                    <Ionicons
                        name='chevron-forward'
                        size={18}
                        color='#64748b'
                    />
                )}
            </View>
            {task ? (
                <View style={styles.details}>
                    <Text style={styles.label}>Задача №{id}</Text>
                    <Text selectable style={styles.value}>
                        {task.address?.display_address || 'Адрес не указан'}
                    </Text>
                    {task.consumer?.full_name && (
                        <Text selectable style={styles.value}>
                            {task.consumer.full_name}
                        </Text>
                    )}
                    <Text style={styles.label}>
                        Лицевой счёт:{' '}
                        {task.address?.account_number || 'не указан'}
                    </Text>
                </View>
            ) : (
                <Text style={styles.label}>Данные задачи недоступны.</Text>
            )}
        </Card>
    );
};

const styles = StyleSheet.create({
    form: {
        padding: 18,
        width: '100%',
        borderWidth: 1,
        borderColor: '#e8edf3',
        borderRadius: 18,
        elevation: 0,
        gap: 12,
    },
    heading: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 10,
    },
    title: { fontSize: 17, fontWeight: '600', color: '#1e293b', flexShrink: 1 },
    label: { fontSize: 13, lineHeight: 19, color: '#64748b' },
    value: { fontSize: 14, lineHeight: 20, color: '#334155' },
    details: { gap: 8 },
});

export default ShortenedTaskForm;
