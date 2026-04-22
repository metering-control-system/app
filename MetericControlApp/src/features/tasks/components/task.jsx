import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '@/shared/components/wrapper/card';
import { colors } from '@/shared/consts/baseColors';
import { taskStatus } from '@/features/tasks/constants/taskStatus';

const Task = ({ task }) => {
    const router = useRouter();

    return (
        <Card
            clickable
            onPress={() => {
                router.push(`/(authorized)/taskDetails/${task.id}`);
            }}
            title={task.customer?.address}
            titleAlign={'flex-end'}>
            <Text style={styles.cardText}>{task.customer?.customerName}</Text>

            <View style={styles.cardPeriod}>
                <Text
                    style={[
                        {
                            borderRadius: 5,
                            paddingVertical: 2,
                            paddingHorizontal: 5,
                            borderWidth: 1,
                        },
                        task.status === taskStatus.in_progress
                            ? { ...colors.secondary }
                            : { ...colors.ordinary },
                    ]}>
                    {task.status}
                </Text>
                <Text
                    style={[
                        {
                            borderRadius: 5,
                            paddingVertical: 2,
                            paddingHorizontal: 5,
                            borderWidth: 1,
                        },
                        task.isUrgent
                            ? { ...colors.warning }
                            : { ...colors.primary },
                    ]}>
                    {task.isUrgent ? 'Срочно' : 'Новая'}
                </Text>
                <Text style={styles.cardText}>Срок: {task.period}</Text>
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
                    }>{`Лицевой счет: ${task.customer?.personalAccount}`}</Text>
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    cardText: { fontSize: 14, fontWeight: 'normal', color: '#9a9a9a' },
    cardPeriod: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    btnPressed: { opacity: 0.75 },
});

export default Task;
