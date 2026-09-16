import { Stack } from 'expo-router';

const CommentsLayout = () => {
    return (
        <Stack>
            <Stack.Screen
                name='[id]'
                options={{ title: 'Комментарии к отчету' }}
            />
        </Stack>
    );
};

export default CommentsLayout;
