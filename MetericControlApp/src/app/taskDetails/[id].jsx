import { useEffect, useRef } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import ScreenLayout from '@/shared/components/screen/screenLayout';

import { tasks } from '@/shared/consts/tasks';

import TaskDetailsForm from '@/features/tasks/components/taskDetailsForm';

import { taskFormDefaultValues } from '@/features/tasks/model/taskFormSchema';

const TaskDescription = () => {
    const { id } = useLocalSearchParams();
    const idRef = useRef();

    useEffect(() => {
        if (!id || idRef.current) return;
        idRef.current = id;
    }, [id]);

    const task = tasks.find((item) => item.id === idRef.current);

    const initialValues = task
        ? {
              customerName: task.customerName || '',
              personalAccount: task.personalAccount || '',
              meter: {
                  type: task.meter?.type || '',
                  number: task.meter?.number || '',
              },
          }
        : taskFormDefaultValues;

    const handleSubmit = () => {
        Alert.alert(
            'Форма валидна',
            'Пока отправка работает как заглушка. Позже подключим API.'
        );
    };

    return (
        <ScreenLayout safe style={{ justifyContent: 'center' }}>
            <ScreenLayout style={styles.card}>
                <Text style={styles.cardTitle}>Информация до начала работ</Text>
                <TaskDetailsForm
                    initialValues={initialValues}
                    onSubmit={handleSubmit}
                />
            </ScreenLayout>
        </ScreenLayout>
    );
};

const styles = StyleSheet.create({
    card: {
        width: '100%',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        borderRadius: 12,
        rowGap: 5,
        minHeight: 100,
        boxSizing: 'border-box',
        shadowColor: '#000',
        shadowOffset: { width: 10, height: 50 },
        shadowOpacity: 1,
        shadowRadius: 10,
        paddingHorizontal: 5,
        paddingVertical: 5,
        backgroundColor: 'white',
        marginBottom: 15,
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 15 },
});

export default TaskDescription;
