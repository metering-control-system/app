import { Stack } from 'expo-router';

const TaskDetailsLayout = () => {
    return (
        <Stack>
            <Stack.Screen name='[id]' options={{ title: 'Описание' }} />
        </Stack>
    );
};

export default TaskDetailsLayout;
