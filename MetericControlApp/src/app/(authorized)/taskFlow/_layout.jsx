import { Stack } from 'expo-router';

const TaskFlowLayout = () => {
    return (
        <Stack>
            <Stack.Screen name='[id]' options={{ headerShown: false }} />
            <Stack.Screen
                name='taskDetails/[id]'
                options={{ title: 'Детали задачи' }}
            />
            <Stack.Screen
                name='reportSubmit/[id]'
                options={{ title: 'Заполнение отчета' }}
            />
        </Stack>
    );
};

export default TaskFlowLayout;
